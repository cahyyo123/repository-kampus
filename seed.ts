import Database from 'better-sqlite3';

const db = new Database('repository.db');

const firstNames = ['Budi', 'Andi', 'Siti', 'Rina', 'Dika', 'Sarah', 'Reza', 'Fajar', 'Nadia', 'Ahmad', 'Yoga', 'Eka', 'Dwi', 'Tri', 'Catur', 'Panca', 'Lestari', 'Putri', 'Bagus', 'Cahya', 'Joko', 'Widodo'];
const lastNames = ['Santoso', 'Wijaya', 'Kusuma', 'Pratama', 'Aditya', 'Fahlevi', 'Nugraha', 'Yasmin', 'Fauzan', 'Purnama', 'Wahyudi', 'Hidayat', 'Siregar', 'Sitompul', 'Simanjuntak', 'Lubis', 'Tarigan', 'Sari', 'Lestari', 'Putra'];
const topics = ['Sistem Pakar', 'Data Mining', 'Machine Learning', 'Computer Vision', 'Internet of Things', 'Sistem Informasi', 'Keamanan Jaringan', 'E-Commerce', 'Game Edukasi', 'Augmented Reality', 'Virtual Reality', 'Robotika', 'Sistem Kendali', 'Geographic Information System', 'Clustering', 'Classification', 'Blockchain', 'Smart Home', 'Smart City'];
const objects = ['Penyakit Tanaman', 'Lalu Lintas', 'Diagnosa Medis', 'Pembelajaran Interaktif', 'Peternakan Ayam', 'Tambak Udang', 'Kualitas Air', 'Pengenalan Wajah', 'Deteksi Emosi', 'Pariwisata', 'Manajemen Aset', 'Kependudukan', 'Bencana Alam', 'Prediksi Cuaca', 'Harga Saham'];

function getRandomItem(arr: any[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomWork(index: number) {
  const category_id = (index % 7) + 1;
  const categories = ['SKRIPSI', 'TA', 'PKL', 'JURNAL', 'GAME', 'VIDEO', 'APP'];
  const codePrefix = categories[category_id - 1];
  const formattedIndex = (index + 11).toString().padStart(3, '0');
  const year = 2020 + Math.floor(Math.random() * 5);
  
  const author1 = `${getRandomItem(firstNames)} ${getRandomItem(lastNames)}`;
  const author = Math.random() > 0.7 ? `${author1}, ${getRandomItem(firstNames)} ${getRandomItem(lastNames)}` : author1;
  const nimNum = 20000000 + Math.floor(Math.random() * 5000000);
  const nim = Math.random() > 0.7 ? `${nimNum}, ${nimNum + 1}` : `${nimNum}`;
  
  const topic = getRandomItem(topics);
  const obj = getRandomItem(objects);
  const title = `Penerapan ${topic} pada ${obj} untuk Meningkatkan Efektivitas di Indonesia`;
  const abstract = `Makalah ini membahas tentang penerapan metoda ${topic} terfokus pada ${obj}. Penelitian ini dilakukan di tahun ${year} dan menunjukkan hasil yang menjanjikan dalam meningkatkan efisiensi dan keakuratan hingga 90%. Berbagai tantangan juga dianalisa, termasuk kebutuhan akan data yang berkualitas.`;

  return {
    document_code: `${codePrefix}-${formattedIndex}`,
    title: title,
    author: author,
    nim: nim,
    year: year,
    abstract: abstract,
    keywords: `${topic}, ${obj}, Teknologi ${year}, Indonesia`,
    category_id: category_id,
    status: 'approved'
  };
}

const works = Array.from({ length: 100 }, (_, i) => generateRandomWork(i));

db.prepare('DELETE FROM repository').run();

const insert = db.prepare(`
  INSERT INTO repository (document_code, title, author, nim, year, abstract, keywords, category_id, status)
  VALUES (@document_code, @title, @author, @nim, @year, @abstract, @keywords, @category_id, @status)
`);

try {
  db.prepare('BEGIN').run();
  for (const work of works) {
    insert.run(work);
  }
  db.prepare('COMMIT').run();
  console.log('Successfully inserted 100 mock student works.');
} catch (error) {
  db.prepare('ROLLBACK').run();
  console.error('Error inserting data:', error);
}


