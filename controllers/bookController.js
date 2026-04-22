export const getBooks = async (req, res) => {
  const books = await Book.find()
    .populate("addedBy", "name email");

  res.json(books);
};