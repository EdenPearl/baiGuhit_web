class Product {
  constructor(id, productName, price, description, quantity, imageUrl) {
    this.id = id;
    this.productName = productName;
    this.price = price;
    this.description = description;
    this.quantity = quantity;
    this.imageUrl = imageUrl;
  }
  
  static fromJson(json) {
    return new Product(
      json.id,
      json.productName,
      json.price,
      json.description,
      json.quantity,
      json.imageUrl
    );
  }
}

export default Product;