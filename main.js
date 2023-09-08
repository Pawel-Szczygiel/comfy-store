
const cartBtn = document.querySelector('.cart-btn');
const closeCartB = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDom = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsCenterDom = document.querySelector('.products-center');

let cart = [];

class Products{
    getProducts = async () => {
        try {
            let { data } = await axios.get('./products.json');

            let products = data.items;
            products = products.map(item => {
                const { title, price } = item.fields;
                const { id } = item.sys;
                let img  = item.fields.image.fields.file.url
                img = img.replace('images','img')
                return {id, title, price, img};
            })

            return products;
        } catch (error) {
            console.log(error)
        }
    }
}

class UI{
    displayProducts = products => {
        let result = '';
        products.forEach(product => {
            const {id, title, price, img} = product;
            result += `
                <article class="product">
                    <div class="img-container">
                        <img src="${img}" alt="product" class="product-img">
                        <button class="bag-btn" data-id="${id}">
                            <i class="fas fa-shopping-cart animation-cart"></i>
                            add to bag
                        </button> 
                    </div>
                    <h3>${title}</h3>
                    <h4>$${price}</h4>
                </article>
            `;
        });
     
        productsCenterDom.innerHTML = result;
    }
}

class Storage{

}

function start() {
    const ui = new UI();
    const products = new Products();

    const data =  products.getProducts()    
    data.then(products => ui.displayProducts(products));
}


document.addEventListener('DOMContentLoaded', start);


