const FAQ_ITEMS = [
  {
    question: 'Is Kadha a Letterboxd alternative?',
    answer:
      "Kadha overlaps with Letterboxd, but it is not trying to replace Letterboxd's public review community. Kadha is focused on privacy-controlled movie and TV tracking, shared collections, and self-hosting.",
  },
  {
    question: 'Why would I use this instead of Letterboxd?',
    answer:
      'Use Kadha if you care more about private defaults, deliberate sharing, JSON export, or self-hosting. Use Letterboxd if you want public reviews, ratings, and a large film community.',
  },
  {
    question: 'Can I share lists with other people?',
    answer: 'Yes. You can create collections and share them with other users using viewer or editor permissions.',
  },
  {
    question: 'Can I keep my watch history private?',
    answer:
      'Yes. New accounts start private. You can separately share your profile and lists with friends or every signed-in user on your Kadha instance.',
  },
  {
    question: 'Is hosted Kadha end-to-end encrypted?',
    answer:
      'No. The hosted operator can technically access stored account and media data, but does not routinely inspect private content. A self-hosted deployment gives its operator control of the server and database.',
  },
  {
    question: 'Is Kadha anonymous?',
    answer:
      'Yes and No. Kadha does not require an email address or phone number, but usernames are searchable and servers may process network information such as IP addresses. Kadha is pseudonymous, not anonymous.',
  },
  {
    question: 'Can I self-host this?',
    answer:
      'Yes. Kadha is open source under the MIT License and includes Docker deployment configuration, so you can run and modify your own instance.',
  },
  {
    question: 'What if I forget my password?',
    answer:
      'Kadha gives you a private recovery code during signup, without asking for an email address or phone number. Save it somewhere safe: if you lose both your password and recovery code, the account cannot be recovered.',
  },
  {
    question: 'Where does the movie and TV data come from?',
    answer: 'Kadha uses TMDB for movie and TV metadata. Kadha is not endorsed or certified by TMDB.',
  },
  {
    question: 'Is this really free?',
    answer:
      'The hosted beta is complimentary and requires no credit card. The long-term plan is a useful free core plus a paid tier for advanced or heavier-use features. Privacy controls, export, deletion, and account security will not be paywalled, and pricing changes will be announced in advance.',
  },
  {
    question: 'Can I import from Letterboxd or Trakt?',
    answer:
      'Not yet. Kadha can export most account data as JSON, but episode-watch history is not included yet. Complete export and imports from Letterboxd, Trakt, and other services are planned.',
  },
];

export default FAQ_ITEMS;
