
import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

// Enhanced helper function to normalize values for matching
const normalizeValue = (value, field) => {
  if (!value) return '';
  let normalized = value.toString().toLowerCase().trim();
  
  if (field === 'linkedin_profile_url') {
    // Remove protocol and www. for more reliable matching
    normalized = normalized.replace(/^(https?:\/\/)?(www\.)?/, '');
    // Remove trailing slashes
    normalized = normalized.replace(/\/+$/, '');
  } else if (field === 'name') {
    // For names: normalize spacing, remove common prefixes/suffixes, handle accents
    normalized = normalized
      .replace(/\s+/g, ' ') // normalize whitespace
      .replace(/^(dr\.?|prof\.?|mr\.?|mrs\.?|ms\.?|miss\.?)\s+/i, '') // remove titles
      .replace(/\s+(jr\.?|sr\.?|iii?|iv)$/i, '') // remove suffixes
      .normalize('NFD') // decompose accented characters
      .replace(/[\u0300-\u036f]/g, '') // remove accent marks
      .replace(/[^a-z\s]/g, ''); // keep only letters and spaces
  }
  
  return normalized;
};

// Helper function for fuzzy name matching
const calculateNameSimilarity = (name1, name2) => {
  const norm1 = normalizeValue(name1, 'name');
  const norm2 = normalizeValue(name2, 'name');
  
  if (norm1 === norm2) return 1.0;
  
  // Check if one name is contained in the other (handles "John Smith" vs "John Michael Smith")
  if (norm1.includes(norm2) || norm2.includes(norm1)) {
    return 0.9;
  }
  
  // Split into words and check for common words
  const words1 = norm1.split(' ').filter(w => w.length > 0);
  const words2 = norm2.split(' ').filter(w => w.length > 0);
  
  if (words1.length === 0 || words2.length === 0) return 0;
  
  const commonWords = words1.filter(w => words2.includes(w));
  const similarity = (commonWords.length * 2) / (words1.length + words2.length);
  
  return similarity;
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
    const { updates, matchField } = await req.json();
    
    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Updates array is required and must not be empty' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const validMatchFields = ['nominee_email', 'linkedin_profile_url', 'name', 'smart_match'];
    if (!matchField || !validMatchFields.includes(matchField)) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Valid matchField is required: ${validMatchFields.join(', ')}` 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`Starting batch update for ${updates.length} nominees, matching by ${matchField}`);

    // Fetch all existing nominees
    const existingNominees = await base44.asServiceRole.entities.Nominee.list();
    
    // Create lookup maps for each field type
    const emailMap = new Map();
    const linkedinMap = new Map();
    const nameList = [];
    
    existingNominees.forEach(nominee => {
      // Email lookup
      if (nominee.nominee_email) {
        const normalizedEmail = normalizeValue(nominee.nominee_email, 'nominee_email');
        if (!emailMap.has(normalizedEmail)) {
          emailMap.set(normalizedEmail, nominee);
        }
      }
      
      // LinkedIn lookup
      if (nominee.linkedin_profile_url) {
        const normalizedLinkedIn = normalizeValue(nominee.linkedin_profile_url, 'linkedin_profile_url');
        if (!linkedinMap.has(normalizedLinkedIn)) {
          linkedinMap.set(normalizedLinkedIn, nominee);
        }
      }
      
      // Name list for fuzzy matching
      if (nominee.name) {
        nameList.push(nominee);
      }
    });

    console.log(`Created lookup maps: ${emailMap.size} emails, ${linkedinMap.size} LinkedIn URLs, ${nameList.length} names`);

    // Helper function to find nominee using smart matching
    const findNomineeSmartMatch = (updateData) => {
      let matchDetails = [];
      
      // Try email first (most reliable)
      if (updateData.nominee_email) {
        const normalizedEmail = normalizeValue(updateData.nominee_email, 'nominee_email');
        const emailMatch = emailMap.get(normalizedEmail);
        if (emailMatch) {
          return { nominee: emailMatch, method: 'email', details: `Found via email: ${updateData.nominee_email}` };
        }
        matchDetails.push(`Email '${updateData.nominee_email}' not found`);
      }
      
      // Try LinkedIn URL second
      if (updateData.linkedin_profile_url) {
        const normalizedLinkedIn = normalizeValue(updateData.linkedin_profile_url, 'linkedin_profile_url');
        const linkedinMatch = linkedinMap.get(normalizedLinkedIn);
        if (linkedinMatch) {
          return { nominee: linkedinMatch, method: 'linkedin', details: `Found via LinkedIn: ${updateData.linkedin_profile_url}` };
        }
        matchDetails.push(`LinkedIn URL '${updateData.linkedin_profile_url}' not found`);
      }
      
      // Try name matching last (fuzzy)
      if (updateData.name) {
        let bestMatch = null;
        let bestScore = 0;
        
        for (const nominee of nameList) {
          const similarity = calculateNameSimilarity(updateData.name, nominee.name);
          if (similarity > bestScore && similarity >= 0.8) {
            bestScore = similarity;
            bestMatch = nominee;
          }
        }
        
        if (bestMatch) {
          const similarityPercent = Math.round(bestScore * 100);
          return { 
            nominee: bestMatch, 
            method: 'name', 
            details: `Found via name match: '${updateData.name}' -> '${bestMatch.name}' (${similarityPercent}% similarity)` 
          };
        }
        matchDetails.push(`Name '${updateData.name}' no good matches found`);
      }
      
      return { nominee: null, method: 'none', details: matchDetails.join('; ') };
    };

    // Helper function for single-field matching (existing logic)
    const findNomineeSingleField = (updateData, field) => {
      const matchValue = updateData[field];
      if (!matchValue) {
        return { nominee: null, method: 'none', details: `Missing ${field} in update data` };
      }

      if (field === 'name') {
        // Fuzzy name matching
        let bestMatch = null;
        let bestScore = 0;
        
        for (const nominee of nameList) {
          const similarity = calculateNameSimilarity(matchValue, nominee.name);
          if (similarity > bestScore && similarity >= 0.8) {
            bestScore = similarity;
            bestMatch = nominee;
          }
        }
        
        if (bestMatch) {
          const similarityPercent = Math.round(bestScore * 100);
          return { 
            nominee: bestMatch, 
            method: 'name', 
            details: `Name match: ${similarityPercent}% similarity` 
          };
        }
      } else if (field === 'nominee_email') {
        const normalizedValue = normalizeValue(matchValue, field);
        const match = emailMap.get(normalizedValue);
        if (match) {
          return { nominee: match, method: 'email', details: 'Exact email match' };
        }
      } else if (field === 'linkedin_profile_url') {
        const normalizedValue = normalizeValue(matchValue, field);
        const match = linkedinMap.get(normalizedValue);
        if (match) {
          return { nominee: match, method: 'linkedin', details: 'LinkedIn URL match' };
        }
      }
      
      return { nominee: null, method: 'none', details: `No match found for ${field}: ${matchValue}` };
    };

    // Process updates in batches
    const BATCH_SIZE = 20;
    const results = {
      totalRequested: updates.length,
      successful: 0,
      notFound: 0,
      errors: 0,
      errorDetails: [],
      matchMethods: { email: 0, linkedin: 0, name: 0, none: 0 }
    };

    for (let i = 0; i < updates.length; i += BATCH_SIZE) {
      const batch = updates.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(updates.length/BATCH_SIZE)}`);
      
      const batchPromises = batch.map(async (updateData, batchIndex) => {
        const overallIndex = i + batchIndex;
        
        try {
          let matchResult;
          
          if (matchField === 'smart_match') {
            matchResult = findNomineeSmartMatch(updateData);
          } else {
            matchResult = findNomineeSingleField(updateData, matchField);
          }
          
          results.matchMethods[matchResult.method]++;
          
          if (!matchResult.nominee) {
            results.notFound++;
            results.errorDetails.push(`Row ${overallIndex + 2}: ${matchResult.details}`);
            return;
          }

          // Prepare update payload (exclude match fields to avoid overwriting)
          const payload = { ...updateData };
          delete payload.nominee_email;
          delete payload.linkedin_profile_url;
          delete payload.name;

          if (Object.keys(payload).length > 0) {
            await base44.asServiceRole.entities.Nominee.update(matchResult.nominee.id, payload);
            results.successful++;
            console.log(`Row ${overallIndex + 2}: Updated via ${matchResult.method} - ${matchResult.details}`);
          } else {
            results.errors++;
            results.errorDetails.push(`Row ${overallIndex + 2}: No new data to update (${matchResult.details})`);
          }
          
        } catch (error) {
          results.errors++;
          results.errorDetails.push(`Row ${overallIndex + 2}: Update failed - ${error.message}`);
          console.error(`Update failed for row ${overallIndex + 2}:`, error);
        }
      });

      await Promise.all(batchPromises);
      
      if (i + BATCH_SIZE < updates.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    const message = `Batch update completed: ${results.successful} successful, ${results.notFound} not found, ${results.errors} errors`;
    console.log(message);
    console.log('Match method breakdown:', results.matchMethods);

    return new Response(JSON.stringify({ 
      success: true, 
      message,
      results
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Batch update failed:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
