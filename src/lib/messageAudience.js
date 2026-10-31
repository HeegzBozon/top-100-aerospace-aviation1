// Who may read a message: copied from its conversation at write time, because
// access rules can only check fields on the message itself.
export function messageAudience(conversation) {
  return {
    participants: conversation?.participants || [],
    is_public: conversation?.type === "channel" && !conversation?.is_private,
  };
}