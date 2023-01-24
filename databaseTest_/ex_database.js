// solution
const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'mysql',
  operatorsAliases: false,
});

const Product = sequelize.define('product', {
  product_name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  product_details: {
    type: Sequelize.TEXT,
  },
  sale_price: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false,
  },
  open_sale_date: {
    type: Sequelize.DATEONLY,
    allowNull: false,
  },
  end_sale_date: {
    type: Sequelize.DATEONLY,
    allowNull: false,
  },
});

const Code = sequelize.define('code', {
  code: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

const Promotion = sequelize.define('promotion', {
  start_date: {
    type: Sequelize.DATEONLY,
    allowNull: false,
  },
  end_date: {
    type: Sequelize.DATEONLY,
    allowNull: false,
  },
  discounted_price: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false,
  },
});

const Bundle = sequelize.define('bundle', {
  bundle_name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  number_of_items: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  bundle_price: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false,
  },
});

Code.belongsTo(Product);
Promotion.belongsTo(Product);
Bundle.belongsTo(Product);

sequelize.sync({ force: true });