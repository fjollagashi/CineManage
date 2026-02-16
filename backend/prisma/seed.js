import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cinemanage.com' },
    update: {},
    create: {
      email: 'admin@cinemanage.com',
      passwordHash: hash,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  });
  console.log('Admin user:', admin.email);

  const movie = await prisma.movie.upsert({
    where: { id: 'seed-movie-1' },
    update: {},
    create: {
      id: 'seed-movie-1',
      title: 'Inception',
      genre: 'Sci-Fi',
      durationMin: 148,
      rating: 'PG-13',
      director: 'Christopher Nolan',
      actors: 'Leonardo DiCaprio, Joseph Gordon-Levitt',
      description: 'A thief who steals corporate secrets through dream-sharing technology is offered a chance to have his criminal record erased.',
      posterUrl: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSE2AvZ3L3xM4D.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
    },
  });

  const start = new Date();
  start.setDate(start.getDate() + 1);
  start.setHours(19, 0, 0, 0);
  const end = new Date(start.getTime() + movie.durationMin * 60 * 1000);

  const show = await prisma.show.create({
    data: {
      movieId: movie.id,
      startTime: start,
      endTime: end,
      ticketPriceStandard: 12,
      ticketPriceVip: 18,
      screenHall: 'Hall 1',
    },
  });

  const rows = ['A', 'B', 'C', 'D', 'E'];
  const seats = rows.flatMap((row, i) =>
    Array.from({ length: 8 }, (_, j) => ({
      showId: show.id,
      row,
      number: j + 1,
      seatType: i === 0 ? 'VIP' : 'STANDARD',
    }))
  );
  await prisma.seat.createMany({ data: seats });
  console.log('Seed movie, show, and seats created.');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
