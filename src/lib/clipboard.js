// Putting a link on the clipboard.
//
// A badge is worn in other people's browsers: an embedded sheet, a locked-down origin, a
// private window with no clipboard at all. So the copy falls back to the old selection
// trick rather than failing silently in the holder's hand, and either way it reports
// whether the text actually went where it was meant to.
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const field = document.createElement('textarea');
      field.value = text;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.appendChild(field);
      field.select();
      const ok = document.execCommand('copy');
      field.remove();
      return ok;
    } catch {
      return false;
    }
  }
}