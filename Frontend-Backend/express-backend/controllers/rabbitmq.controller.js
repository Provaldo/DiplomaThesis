exports.userProducer = (req, res) => {
  res.status(200).send({ message: "Producer created." });
};

exports.userConsumer = (req, res) => {
  res.status(200).send({ message: "Consumer created." });
};
