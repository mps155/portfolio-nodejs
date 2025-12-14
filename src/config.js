// Coloque aqui sua string de conexão ou use variável de ambiente MONGO_URI
module.exports = {
  mongoUri: process.env.MONGO_URI || 'mongodb+srv://user:UXG4@myapi.dpv3ofe.mongodb.net/?appName=MyAPI',
  dbName: process.env.MONGO_DB_NAME || 'Bank'
};
