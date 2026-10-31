/** The content of the landing page that is data rather than markup. */

export const NAV_LINKS = [
  { href: "#product", label: "Product" },
  { href: "#security", label: "Security" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
];

export const FAQ_ITEMS = [
  {
    question: "How can I verify that my files are encrypted?",
    answer:
      "Every file is encrypted on your device before it is uploaded, and the code that does it is public on GitHub, so you can read it. You can also look at what your browser sends: it is unreadable data, and that is all our servers ever get.",
  },
  {
    question: "What if I forget a drive's password?",
    answer:
      "Nobody can reset it, not even us. Your device makes the key from the password and neither of them ever reaches our servers, which is exactly why nobody else can read your files. Keep each drive's password in a password manager.",
  },
  {
    question: "Can I share a drive with other people?",
    answer:
      "Yes. Invite people by email as readers, writers or admins, or publish a read-only link. Everyone still needs the drive's password to read anything, and you give it to them yourself, outside Owload, so it is never in an invitation.",
  },
  {
    question: "How much storage do I get for free?",
    answer:
      "3 GB. If you need more, connect an S3 storage of your own: your files stay encrypted on your device before they reach it, and you can keep as much as it holds.",
  },
  {
    question: "What is AI Guard?",
    answer:
      "An AI agent that keeps watch over our server and its logs and checks that nothing suspicious is going on. It works with what the server has, and the server never has your files, their names or your password.",
  },
];

/** The root of the public repositories: the client that does the encryption and the server that stores the ciphertext are both there. */
export const SOURCE_CODE_URL = "https://github.com/owload";

export const CONTACT_EMAIL = "info@owload.com";
