// THE DESK'S ONE MEGAPHONE — how the Patron desk shouts at itself.
//
// Three scheduled jobs need to reach the people who work the pipeline, and all three must
// reach them the same way: the admins of the house, as a transactional notice, never a
// digest a buyer could be copied on. Kept here so the recipient rule is written once.

export async function deskRecipients(sr: any): Promise<string[]> {
  const admins = await sr.entities.User.filter({ role: 'admin' }).catch(() => []);
  return (admins || []).map((user: any) => user.email).filter(Boolean);
}

export async function notifyDesk(sr: any, subject: string, body: string): Promise<number> {
  const recipients = await deskRecipients(sr);
  await Promise.all(
    recipients.map((to: string) =>
      sr.integrations.Core.SendEmail({ to, subject, body, category: 'transactional' }).catch(() => null),
    ),
  );
  return recipients.length;
}

// Dates on these records are plain calendar days, so they are compared as strings.
export const todayISO = () => new Date().toISOString().slice(0, 10);

export function dayFrom(base: string | undefined, days: number): string {
  const start = base ? new Date(base) : new Date();
  start.setDate(start.getDate() + days);
  return start.toISOString().slice(0, 10);
}