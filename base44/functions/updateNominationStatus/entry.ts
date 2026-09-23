// RETIRED. Legacy Nomination records were migrated into NominationIntake.
// Review and approve nominations from Admin → Nomination Intake.
export default async function(req) {
  return Response.json(
    { error: 'The legacy Nomination entity is retired. Manage nominations in Admin → Nomination Intake.' },
    { status: 410 }
  );
}