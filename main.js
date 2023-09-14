
const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
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
    }

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
                    let cartItem = {...Storage.getProduct(id), amount:1};
                    //!add product to the cart
                    cart = [...cart, cartItem];
                    
                    //!save cart in local storage
                    Storage.saveToLocalStorage('cart', cart);
                    //! set cart items
                    this.setCartValues(cart);
                    //! display cart item
                    this.addCartItem(cartItem)
                    //! show the cart 
                    this.showCart();
                });
        });
    }

    setCartValues = cart => {
        let priceTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            priceTotal += item.price * item.amount;
            itemsTotal += item.amount;
        });
        cartItems.innerText = itemsTotal;
        cartTotal.innerText = priceTotal.toFixed(2);
    }

    addCartItem = item => {
        const {id, title, price, img, amount} = item;
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `
            <img src=${img} alt=${title}>
            <div >
                <h4>${title}</h4>
                <h5>$${price}</h5>
                <span class="remove-item" data-id=${id}>remove</span>
            </div>
            <div>
                <i class="fas fa-chevron-up" data-id=${id}></i>
                <p class="item-amount">${amount}</p>
                <i class="fas fa-chevron-down" data-id=${id}></i>
            </div>
        `;
        cartContent.append(div);
     
    }

    showCart = () => {
        cartOverlay.classList.add('transparentBcg');
        cartDom.classList.add('showCart');
    }
    hideCart = () => {
        cartOverlay.classList.remove('transparentBcg');
        cartDom.classList.remove('showCart');
    }

    displayCart = cart => cart.forEach(item => this.addCartItem(item));

    getSingleButton = id => buttonsDOM.find(btn => btn.dataset.id === id);

    

    removeItem = id => {
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        Storage.saveToLocalStorage('cart', cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-shopping-cart animation-cart"></i>
        add to bag`;
    }

    clearCart = () => {
        const cartItemsId = cart.map(item => item.id);
        cartItemsId.forEach(id => this.removeItem(id));
        cartContent.innerHTML = '';
        this.hideCart();
    }

    cartLogic = () => {
        clearCartBtn.addEventListener('click', () => {
            this.clearCart();
        });
        cartContent.addEventListener('click', e => {
            const domElement = e.target;
        
            if( domElement.classList.contains('remove-item') ) {
                this.removeItem(domElement.dataset.id);
                domElement.closest('.cart-item').remove();
            }
            else if( domElement.classList.contains('fa-chevron-up') ) {
                const productId = domElement.dataset.id;
                let findItem = cart.find(item => item.id === productId);
                
                findItem.amount += 1;
                Storage.saveToLocalStorage('cart', cart);
                this.setCartValues(cart);
                domElement.nextElementSibling.innerText = findItem.amount;
            }   
            else if( domElement.classList.contains('fa-chevron-down') ) {
                const productId = domElement.dataset.id;
                let findItem = cart.find(item => item.id === productId);
                
                findItem.amount -= 1;
                if (findItem.amount < 1) {
                    this.removeItem(productId);
                    domElement.closest('.cart-item').remove();
                }
                Storage.saveToLocalStorage('cart', cart);
                this.setCartValues(cart);
                domElement.previousElementSibling.innerHTML = findItem.amount;
            }   
        });
    }


    setupApp = () => {
        cart = Storage.getCart('cart');
        this.setCartValues(cart);
        this.displayCart(cart);
        cartBtn.addEventListener('click', this.showCart);
        closeCartBtn.addEventListener('click', this.hideCart);
    }
}

class Storage{
    static saveToLocalStorage = (key, arr) => {
        localStorage.setItem(key, JSON.stringify(arr));
    }

    static getProduct = lookingProductId => {
        const products = JSON.parse( localStorage.getItem('products')); 
        const product = products.find(product => product.id === lookingProductId);
        return product;
    }

    static getCart = key => JSON.parse(localStorage.getItem(key)) || [];
    static clearCart = key => localStorage.removeItem(key);
}

function start() {
    const ui = new UI();
    const products = new Products();
    ui.setupApp();

    const data =  products.getProducts()    
    data
        .then(products => { 
        ui.displayProducts(products) ;
        Storage.saveToLocalStorage('products',products) })
        .then(() => {
            ui.getBagButtons();
            ui.cartLogic();
        } )
}


document.addEventListener('DOMContentLoaded', start);


