
import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

// Helper function to add delays between operations
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to normalize LinkedIn URLs for comparison
const normalizeLinkedInUrl = (url) => {
  if (!url) return null;
  let normalized = url.toLowerCase().trim().replace(/\/+$/, '');
  if (normalized.includes('?')) {
    normalized = normalized.split('?')[0];
  }
  if (!normalized.includes('linkedin.com')) return null;
  return normalized;
};

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  if (!(await base44.auth.isAuthenticated())) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    console.log('Starting BULK nominee deduplication process...');
    
    // 1. Fetch all nominees
    const allNominees = await base44.asServiceRole.entities.Nominee.list();
    console.log(`Found ${allNominees.length} total nominees`);
    
    if (allNominees.length < 2) {
      return new Response(JSON.stringify({ success: true, message: 'Not enough nominees to find duplicates.' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 2. Identify all duplicates and plan actions
    const idsToDelete = new Set();
    const updatesMap = new Map(); // Use a Map to consolidate updates for a single keeper
    let secondaryEmailsAddedCount = 0; // New counter for secondary emails added

    const processGroup = (group, matchType = 'email') => {
      if (group.length <= 1) return;

      const activeNominees = group.filter(n => !idsToDelete.has(n.id));
      if (activeNominees.length <= 1) return;

      activeNominees.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
      const keepNominee = activeNominees[0];
      const duplicates = activeNominees.slice(1);
      
      const currentUpdate = updatesMap.get(keepNominee.id) || {};

      // Collect all emails from keeper and duplicates
      const allEmails = new Set();
      const keeperPrimaryEmail = keepNominee.nominee_email ? keepNominee.nominee_email.toLowerCase().trim() : null;
      if (keeperPrimaryEmail) {
        allEmails.add(keeperPrimaryEmail);
      }
      if (keepNominee.secondary_emails && Array.isArray(keepNominee.secondary_emails)) {
        keepNominee.secondary_emails.forEach(email => allEmails.add(email.toLowerCase().trim()));
      }

      for (const duplicate of duplicates) {
        idsToDelete.add(duplicate.id);

        // Collect emails from duplicates
        if (duplicate.nominee_email) {
          allEmails.add(duplicate.nominee_email.toLowerCase().trim());
        }
        if (duplicate.secondary_emails && Array.isArray(duplicate.secondary_emails)) {
          duplicate.secondary_emails.forEach(email => {
            allEmails.add(email.toLowerCase().trim());
          });
        }

        // Consolidate data into the keeper's update payload
        if (!currentUpdate.name && !keepNominee.name && duplicate.name) { currentUpdate.name = duplicate.name; }
        if (!currentUpdate.linkedin_profile_url && !keepNominee.linkedin_profile_url && duplicate.linkedin_profile_url) { currentUpdate.linkedin_profile_url = duplicate.linkedin_profile_url; }
        if (!currentUpdate.description && !keepNominee.description && duplicate.description) { currentUpdate.description = duplicate.description; }
        if (!currentUpdate.bio && !keepNominee.bio && duplicate.bio) { currentUpdate.bio = duplicate.bio; }
        if (!currentUpdate.title && !keepNominee.title && duplicate.title) { currentUpdate.title = duplicate.title; }
        if (!currentUpdate.company && !keepNominee.company && duplicate.company) { currentUpdate.company = duplicate.company; }
        if (!currentUpdate.country && !keepNominee.country && duplicate.country) { currentUpdate.country = duplicate.country; }
        if (!currentUpdate.industry && !keepNominee.industry && duplicate.industry) { currentUpdate.industry = duplicate.industry; }
        if (!currentUpdate.photo_url && !keepNominee.photo_url && duplicate.photo_url) { currentUpdate.photo_url = duplicate.photo_url; }
        if (!currentUpdate.avatar_url && !keepNominee.avatar_url && duplicate.avatar_url) { currentUpdate.avatar_url = duplicate.avatar_url; }
      }

      // Prepare secondary emails for update, excluding the keeper's primary email
      const newSecondaryEmails = Array.from(allEmails).filter(email => 
        email !== keeperPrimaryEmail
      );
      
      // Only set secondary_emails if there are actual secondary emails to add/update
      // and they are different from what the keeper already has
      const existingSecondaryEmails = keepNominee.secondary_emails || [];
      const hasNewSecondaryEmails = newSecondaryEmails.some(email => !existingSecondaryEmails.includes(email)) ||
                                     existingSecondaryEmails.some(email => !newSecondaryEmails.includes(email));

      if (newSecondaryEmails.length > 0 && hasNewSecondaryEmails) {
        currentUpdate.secondary_emails = newSecondaryEmails;
        // Increment the counter if secondary emails are being added/updated for this nominee
        if (Object.keys(currentUpdate).length > 0) { // Only count if there's an actual update planned
          secondaryEmailsAddedCount++;
        }
      } else if (newSecondaryEmails.length === 0 && (existingSecondaryEmails.length > 0 || currentUpdate.secondary_emails)) {
        // If all emails collapsed to primary, clear secondary_emails in the update
        currentUpdate.secondary_emails = [];
        if (Object.keys(currentUpdate).length > 0) {
          secondaryEmailsAddedCount++; // Count this as an update to secondary emails (clearing them)
        }
      }


      if (Object.keys(currentUpdate).length > 0) {
        updatesMap.set(keepNominee.id, currentUpdate);
      }
    };

    // Group by email (exact matches)
    const emailGroups = allNominees.reduce((acc, n) => {
      if (n.nominee_email) {
        const email = n.nominee_email.toLowerCase().trim();
        if (!acc[email]) acc[email] = [];
        acc[email].push(n);
      }
      return acc;
    }, {});
    for (const group of Object.values(emailGroups)) {
      processGroup(group, 'email');
    }

    // Group remaining by LinkedIn (for cases where same person has different emails or LinkedIn is the primary match)
    const remainingNominees = allNominees.filter(n => !idsToDelete.has(n.id));
    const linkedinGroups = remainingNominees.reduce((acc, n) => {
      const url = normalizeLinkedInUrl(n.linkedin_profile_url);
      if (url) {
        if (!acc[url]) acc[url] = [];
        acc[url].push(n);
      }
      return acc;
    }, {});
    for (const group of Object.values(linkedinGroups)) {
      processGroup(group, 'linkedin');
    }

    // 3. Execute deletions one-by-one with a safe delay
    const deletedIdsArray = Array.from(idsToDelete);
    let deletedCount = 0;
    if (deletedIdsArray.length > 0) {
      console.log(`Attempting to delete ${deletedIdsArray.length} duplicate nominees one by one...`);
      for (const idToDelete of deletedIdsArray) {
        try {
          await base44.asServiceRole.entities.Nominee.delete(idToDelete);
          deletedCount++;
          await delay(300); // Add a 300ms delay to avoid rate limiting
        } catch (err) {
          console.error(`Failed to delete nominee ${idToDelete}:`, err.message);
        }
      }
      console.log('Deletion process completed.');
    }
    
    // 4. Execute updates one-by-one with a safe delay
    let mergedCount = 0;
    if (updatesMap.size > 0) {
        console.log(`Attempting to update ${updatesMap.size} keeper nominees...`);
        for (const [idToUpdate, updateData] of updatesMap.entries()) {
            try {
                await base44.asServiceRole.entities.Nominee.update(idToUpdate, updateData);
                mergedCount++;
                await delay(300); // Add delay for updates as well
            } catch(err) {
                console.error(`Failed to update nominee ${idToUpdate}:`, err.message);
            }
        }
        console.log('Update process completed.');
    }

    // 5. Return a success response
    const message = `Deduplication completed successfully! 
      Deleted ${deletedCount} duplicate records.
      Updated ${mergedCount} records with consolidated information.
      ${secondaryEmailsAddedCount > 0 ? `Updated secondary emails for ${secondaryEmailsAddedCount} nominee(s).` : ''}`;

    console.log(message);
    
    return new Response(JSON.stringify({ 
      success: true, 
      message,
      stats: {
        deleted: deletedCount,
        updated: mergedCount,
        secondaryEmailsUpdatedCount: secondaryEmailsAddedCount // Renamed for clarity
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Deduplication error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: `Deduplication failed: ${error.message}` 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
