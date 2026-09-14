const FAQ_ITEMS = [
  {
    question: 'What is Kadha?',
    answer:
      'Kadha is a movie and TV tracker for your personal viewing history, shared collections, recommendations, and viewing insights. You can use the hosted beta or run your own instance.',
  },
  {
    question: 'How is it different from Letterboxd or Trakt?',
    answer:
      'Kadha focuses on private defaults, deliberate sharing, movie and TV tracking, data portability, and self-hosting. Letterboxd is stronger for public film reviews and community activity, while Trakt is stronger for tracking integrations and automation.',
  },
  {
    question: 'Is my activity private?',
    answer:
      'New accounts, profile sections, and collections start private. You can separately share them with friends, signed-in Kadha users, or anyone on the web.',
  },
  {
    question: 'Why does signup not ask for an email?',
    answer:
      'Kadha uses a username, password, and private recovery code instead. Save the recovery code outside Kadha: if you lose both it and your password, the account cannot be recovered.',
  },
  {
    question: 'Can I import an existing library?',
    answer:
      'Kadha can import its own versioned JSON exports. Direct imports from Letterboxd, Trakt, and other tracking services are not available yet.',
  },
  {
    question: 'Can the hosted operator see my data?',
    answer:
      'The hosted service is not end-to-end encrypted. The operator can technically access stored data and backups, although private content is not routinely inspected. Self-hosting gives the instance operator control of that infrastructure.',
  },
  {
    question: 'Is Kadha anonymous?',
    answer:
      'No. Kadha does not require an email address or phone number, but usernames are searchable and servers process network information such as IP addresses. Treat your account as pseudonymous, not anonymous.',
  },
  {
    question: 'Is Kadha free?',
    answer:
      'The hosted beta is currently free and does not require a payment method. Kadha is also open source under the MIT License. Any future hosted pricing will be announced in advance, and nobody will be charged without choosing a paid plan.',
  },
];

export default FAQ_ITEMS;
