import storage from './server/services/storageService.js';

const test = async () => {
  console.log('🧪 Testing StorageService Queries (JSON Mode)...');
  
  // Ensure we are in JSON mode for this test
  storage.isUsingMongo = false;
  
  // Seed some data if empty
  if (storage.data.books.length === 0) {
    await storage.seed();
  }
  
  console.log('\n1. Testing Basic Search (Book title)');
  const booksByTitle = await storage.find('Book', { title: 'Clean Code' });
  console.log('Results:', booksByTitle.length, 'books found');
  console.log('Titles:', booksByTitle.map(b => b.title));

  console.log('\n2. Testing Case-Insensitive Search (Author)');
  const booksByAuthor = await storage.find('Book', { author: 'paulo' });
  console.log('Results:', booksByAuthor.length, 'books found');
  console.log('Authors:', booksByAuthor.map(b => b.author));

  console.log('\n3. Testing Regex-like Search (Category)');
  const booksByCategory = await storage.find('Book', { category: '/tech/i' });
  console.log('Results:', booksByCategory.length, 'books found');
  console.log('Categories:', booksByCategory.map(b => b.category));

  console.log('\n4. Testing $or Query');
  const orBooks = await storage.find('Book', { 
    $or: [
      { title: 'Clean Code' },
      { category: 'Fiction' }
    ]
  });
  console.log('Results:', orBooks.length, 'books found');
  console.log('Titles:', orBooks.map(b => b.title));

  console.log('\n5. Testing Pagination (Limit)');
  const limitedBooks = await storage.find('Book', {}, { limit: 1 });
  console.log('Results (Limit 1):', limitedBooks.length);

  console.log('\n6. Testing Sorting (Published Year DESC)');
  const sortedBooks = await storage.find('Book', {}, { sort: { publishedYear: -1 } });
  console.log('Years:', sortedBooks.map(b => b.publishedYear));

  console.log('\n✅ Query Tests Completed!');
  process.exit(0);
};

test();
