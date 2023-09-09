
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
let buttonsDOM = [];

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
    };

    getBagButtons = () => {
        const bagButtons = [...document.querySelectorAll('.bag-btn')];
        buttonsDOM = bagButtons;
        
        bagButtons.forEach(btn => {
            let id = btn.getAttribute('data-id');
            let inCart = cart.find(item => item.id === id);
            if(inCart) {
                btn.innerText = 'In Cart';
                btn.disabled = true;
            } 
                
            btn.addEventListener('click', e => {
                    const clickedBtn = e.target;
                    clickedBtn.innerText = 'In Cart';
                    clickedBtn.disabled = true;
                    //!get product from local storage
                    let cartItem = Storage.getProduct(id);
                    //!add product to the cart
                    cart = [...cart, {...cartItem, amount:1} ];
                    
                    //!save cart in local storage
                    Storage.saveToLocalStorage(cart,'cart');
                    //! set cart items

                    //! display cart item
                    
                    //! show the cart 

                })
            

        });
    }

}

class Storage{
    static saveToLocalStorage = (arr, thing) => {
        localStorage.setItem(thing, JSON.stringify(arr));
    }

    static getProduct = lookingProductId => {
        const products = JSON.parse( localStorage.getItem('products')); 
        const product = products.find(product => product.id === lookingProductId);
        return product;
    }
}

function start() {
    const ui = new UI();
    const products = new Products();

    const data =  products.getProducts()    
    data
        .then(products => { 
        ui.displayProducts(products) ;
        Storage.saveToLocalStorage(products,'products') })
        .then(() => {
            ui.getBagButtons()
        } )
}


document.addEventListener('DOMContentLoaded', start);


