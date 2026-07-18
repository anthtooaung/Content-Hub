import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'test@test.com';
  const password = await hash('password123', 12);

  const user = await prisma.users.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password_hash: password,
      name: 'Test User',
    },
  });

  console.log(`✓ User: ${email} / password123 (id: ${user.id})`);

  // Sample content
  const samples = [
    {
      platform: 'TikTok',
      tone: 'Casual',
      post: 'POV: You just discovered the best coffee spot in town ☕ Our new seasonal blend is here and it\'s a game changer. Stop by this weekend and taste the difference! #CoffeeLover #LocalBusiness',
      hashtags: ['#CoffeeLover', '#LocalBusiness', '#SeasonalBlend', '#WeekendVibes', '#CoffeeShop'],
      caption: 'Our new seasonal blend just dropped! Come say hi this weekend.',
      callToAction: 'Visit us this weekend!',
    },
    {
      platform: 'Instagram',
      tone: 'Professional',
      post: 'Introducing our new seasonal blend — crafted for those who appreciate the finer things. Each cup tells a story of quality beans, expert roasting, and pure passion. Available now while supplies last.',
      hashtags: ['#SpecialtyCoffee', '#CoffeeArt', '#QualityFirst', '#SeasonalCollection', '#BloomAndBrew'],
      caption: 'Quality you can taste. Experience our new seasonal blend — available now.',
      callToAction: 'Order now through the link in bio',
    },
    {
      platform: 'Facebook',
      tone: 'Inspirational',
      post: 'Every great day starts with a great cup of coffee. We\'re excited to share our brand new seasonal blend with our community! Made with ethically sourced beans and roasted to perfection. Come in and let us make your morning special. 🌟',
      hashtags: ['#MorningCoffee', '#CommunityFirst', '#EthicallySourced', '#SupportLocal', '#NewBlend'],
      caption: 'Great coffee, great community. Our new seasonal blend is here!',
      callToAction: 'Tag a friend who needs to try this!',
    },
  ];

  for (const s of samples) {
    const content = await prisma.content.create({
      data: {
        userId: user.id,
        platform: s.platform,
        tone: s.tone,
        post: s.post,
        hashtags: s.hashtags,
        caption: s.caption,
        callToAction: s.callToAction,
      },
    });
    console.log(`✓ ${s.platform} content created`);
  }

  console.log('\nDone! Login with: test@test.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
