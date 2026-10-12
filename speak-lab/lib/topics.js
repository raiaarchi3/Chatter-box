const mk = (easy, medium, hard) => [
  ...easy.map((t) => ({ t, l: 'easy' })),
  ...medium.map((t) => ({ t, l: 'medium' })),
  ...hard.map((t) => ({ t, l: 'hard' })),
];

export const LANGS = [
  { value: 'en-US', label: 'US EN' },
  { value: 'en-GB', label: 'UK EN' },
  { value: 'en-IN', label: 'IN EN' },
  { value: 'en-AU', label: 'AU EN' },
];

export const LEVELS = [
  { value: 'random', label: 'Random', icon: '🎲' },
  { value: 'easy', label: 'Easy', icon: '🟢' },
  { value: 'medium', label: 'Medium', icon: '🟡' },
  { value: 'hard', label: 'Hard', icon: '🔴' },
];

export const CATEGORIES = [
  { value: 'general', label: 'General', icon: '💬' },
  { value: 'tech', label: 'Tech', icon: '💻' },
  { value: 'finance', label: 'Finance', icon: '💰' },
  { value: 'hot', label: 'Hot Takes', icon: '🌶️' },
  { value: 'pitch', label: 'One-Minute Pitch', icon: '💡' },
  { value: 'eli5', label: "Explain It Like I'm 5", icon: '👶' },
];

export const TOPICS = {
  general: mk(
    ['Describe your perfect weekend.', 'Talk about a person who inspired you.', 'What is your favourite food and why?', 'Describe your hometown to a stranger.', 'What is the best gift you have ever received?', 'Talk about your favourite season.', 'Describe your morning routine.', 'What hobby would you love to try?'],
    ['Is it better to be a specialist or a generalist?', 'What does a good life look like to you?', 'What makes a good friend?', 'Is failure necessary for success?', 'Should you follow your passion or choose a stable career?', 'How do you handle stress?', 'Is it better to travel or to save money?', 'What is one habit that changed your life?'],
    ['Is privacy still possible in a connected world?', 'Should we aim for happiness or meaning?', 'Is free will an illusion?', 'Does money buy happiness?', 'Should we judge people by their intentions or their outcomes?', 'Is it ever right to break a promise?', 'Will humanity be better off in 100 years?', 'Is nostalgia helpful or harmful?'],
  ),
  tech: mk(
    ['What is your favourite app and why?', 'How has your phone changed your daily life?', 'Should kids have smartphones?', 'Describe a gadget you cannot live without.', 'What is your favourite website and why?', 'How do you use YouTube to learn?', 'What is the most annoying thing about technology?', 'Would you use a self-driving car?'],
    ['Will AI replace more jobs than it creates?', 'Is open source sustainable?', 'Is laptop life making us less healthy?', 'Are smart homes worth it?', 'Should coding be taught in every school?', 'Is cloud storage safer than a hard drive?', 'Do we rely too much on Google Maps?', 'Will electric vehicles replace petrol cars?'],
    ['Should powerful AI models be open-sourced?', 'Is social media a net negative for democracy?', 'Should governments regulate AI?', 'Is Big Tech too powerful?', 'Should facial recognition be banned in public places?', 'Is quantum computing hype or reality?', 'Who is responsible when an AI makes a mistake?', 'Will AI ever be conscious?'],
  ),
  finance: mk(
    ['Why is saving money hard?', 'What would you do with a surprise bonus?', 'How do you decide whether to buy something?', 'Is it better to pay by cash or card?', 'What is the best money advice you ever got?', 'Should kids get pocket money?', 'What would you buy with your first big salary?', 'Why do people love sales and discounts?'],
    ['Is renting better than buying a house?', 'Should schools teach personal finance?', 'Is investing in stocks just gambling?', 'Should you pay off debt or invest first?', 'Is a side hustle worth the stress?', 'Are credit cards good or bad?', 'Is cryptocurrency a real currency?', 'How big should an emergency fund be?'],
    ['Is a universal basic income realistic?', 'Do index funds make markets less efficient?', 'Is inflation a hidden tax?', 'Should billionaires exist?', 'Will cash disappear completely?', 'Is the gig economy exploitation or freedom?', 'Should central banks print money in a crisis?', 'Is homeownership still a good investment?'],
  ),
  hot: mk(
    ['Pineapple belongs on pizza.', 'Mornings are overrated.', 'Cats are better than dogs.', 'Breakfast is the best meal of the day.', 'Summer is better than winter.', 'Tea beats coffee.', 'Books are better than movies.', 'Weekends are too short.'],
    ['Talent is overrated — consistency wins every time.', 'Remote work makes teams worse.', 'Social media makes us lonelier.', 'Homework should be banned.', 'Money can buy happiness.', 'Cancel culture has gone too far.', 'Multitasking is a myth.', 'Every student should learn a trade skill.'],
    ['Hustle culture is a scam.', 'College degrees will be irrelevant in 20 years.', 'Work-life balance is a myth.', 'Meritocracy does not exist.', 'Privacy is dead and we should accept it.', 'Zoos should be abolished.', 'Voting should be mandatory.', 'Standardised exams are unfair.'],
  ),
  pitch: mk(
    ['Pitch a snack nobody has invented yet.', 'Pitch a new school subject.', 'Pitch a new board game.', 'Pitch a cafe with a twist.', 'Pitch a mobile game for kids.', 'Pitch a new national holiday.', 'Pitch a reusable water bottle.', 'Pitch a perfect weekend getaway.'],
    ['Pitch an app that fixes procrastination.', 'Pitch a product for people who travel a lot.', 'Pitch a service for busy parents.', 'Pitch a fitness app for people who hate gyms.', 'Pitch a subscription box.', 'Pitch a tool that helps students study.', 'Pitch a platform for local artists.', 'Pitch a smart backpack.'],
    ['Pitch a startup to investors in a boring industry.', 'Pitch why your city should host the Olympics.', 'Pitch a plan to fix traffic in a big city.', 'Pitch yourself to a billion-dollar investor.', 'Pitch a company that turns food waste into value.', 'Pitch an AI product for farmers.', 'Pitch a climate-tech startup to sceptical investors.', 'Pitch a replacement for the school exam system.'],
  ),
  eli5: mk(
    ['Explain how the internet works.', 'Explain why the sky is blue.', 'Explain how rain happens.', 'Explain why we sleep.', 'Explain how airplanes fly.', 'Explain what electricity is.', 'Explain why the moon changes shape.', 'Explain what money is.'],
    ['Explain inflation.', 'Explain how vaccines work.', 'Explain how Wi-Fi works.', 'Explain what the stock market is.', 'Explain climate change.', 'Explain how GPS knows where you are.', 'Explain what a black hole is.', 'Explain how democracy works.'],
    ['Explain blockchain.', 'Explain how large language models work.', 'Explain how encryption keeps messages secret.', 'Explain relativity.', 'Explain how mRNA vaccines work.', 'Explain what interest rates do.', 'Explain quantum computing.', 'Explain how the immune system learns.'],
  ),
};

export const INTERVIEW_SETS = [
  { value: 'behavioral', label: 'Behavioral', icon: '💬' },
  { value: 'consulting', label: 'Consulting', icon: '💼' },
];

export const INTERVIEW = {
  behavioral: mk(
    ['Tell me about yourself.', 'Why do you want this job?', 'What are your strengths?', 'What are your weaknesses?', 'Where do you see yourself in five years?', 'Why should we hire you?', 'What motivates you?', 'What do you know about our company?'],
    ['Tell me about a time you resolved a conflict between team members.', 'Describe a time you failed and what you learned.', 'What is your management style?', 'Tell me about a time you worked under pressure.', 'Describe a time you showed leadership.', 'Tell me about a goal you achieved.', 'How do you handle criticism?', 'Describe a time you went above and beyond.'],
    ['Tell me about a time you disagreed with your manager and were right.', 'Describe a decision you made with incomplete information.', 'Tell me about a time you had to influence without authority.', 'Tell me about a time you had to deliver bad news.', 'Describe a time you changed your mind after new evidence.', 'What is your biggest professional regret?', 'Describe a time you led a team through ambiguity.', 'Tell me about an unpopular decision you made.'],
  ),
  consulting: mk(
    ['Why consulting?', 'Why our firm?', 'Walk me through your resume.', 'What is the most important skill for a consultant?', 'Tell me about a team project you led.', 'Why this industry?', 'How do you structure your thinking when a problem is unclear?', 'What does a good client relationship look like?'],
    ["A client's profits are falling. How do you approach it?", 'How would you size the market for electric scooters in Delhi?', 'How many cups of tea are sold in India each day?', 'A client wants to launch a new product. What do you consider?', 'Should a restaurant chain open more outlets?', 'How would you price a new streaming service?', "An airline's revenue is flat. Why might that be?", 'How would you reduce churn at a telecom company?'],
    ['Should a telecom company enter banking? Structure your answer.', 'A retailer wants to cut costs by 20%. Walk me through your plan.', 'A client wants to acquire a competitor. How do you evaluate it?', 'Should a hospital chain expand abroad?', 'Estimate the market for EV charging in India in 10 years.', "A bank's customers are leaving. Diagnose and recommend.", 'Should a pharma company drop an unprofitable drug?', 'How would you turn around a failing newspaper?'],
  ),
};

export const FRAMEWORKS = [
  { name: 'STAR', body: 'Situation → Task → Action → Result. Best for behavioural stories.' },
  { name: 'PREP', body: 'Point → Reason → Example → Point. Best for opinions and quick answers.' },
  { name: 'PPF', body: 'Past → Present → Future. Best for "tell me about yourself".' },
];

export const VOCAB = mk(
  ['Candid', 'Resilient', 'Meticulous', 'Pragmatic', 'Eloquent', 'Diligent', 'Intuitive', 'Versatile'],
  ['Astuteness', 'Equivocate', 'Languid', 'Ephemeral', 'Ubiquitous', 'Magnanimous', 'Capricious', 'Juxtapose'],
  ['Obsequious', 'Perspicacious', 'Pusillanimous', 'Sycophant', 'Ineffable', 'Recalcitrant', 'Sanguine', 'Truculent'],
);

export function pool(list, level) {
  const filtered = level === 'random' ? list : list.filter((x) => x.l === level);
  return (filtered.length ? filtered : list).map((x) => x.t);
}
