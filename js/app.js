
const productsUrl = 'http://localhost:3000/products';
const cards = document.getElementById('cards')
const totalCantNav = document.getElementById('total-count')
const itemsCart = document.getElementById('items')
const footerCart = document.getElementById('footer-cart')
const templateCard = document.getElementById('template-card').content
const templateCart = document.getElementById('template-cart').content
const templateFooter = document.getElementById('template-footer').content
const fragment = document.createDocumentFragment()

let cart = {

}



document.addEventListener('DOMContentLoaded', () => {
    fetchProducts()
    if(localStorage.getItem('cart')){
        cart = JSON.parse(localStorage.getItem('cart'))
        displayCart()
    }
})

cards.addEventListener('click', e => {
    addCart(e)
})

items.addEventListener('click', e => {
    btnAction(e)
})

const fetchProducts = async () => {
    try {
        const response = await fetch(productsUrl)
        const data = await response.json();
        displayCard(data)
    } catch (error) {
        console.log(error)
    }
}

const displayCard = (data) => {
    
    data.data.map(producto => {
       templateCard.querySelector('h5').textContent = producto.attributes.name
       templateCard.querySelector('p').textContent = producto.attributes.price
       templateCard.querySelector('img').setAttribute('src', 'http://superprosamui.com/2016/wp-content/plugins/ap_background/images/default/default_1.png')
       templateCard.querySelector('.btn-outline-dark').dataset.id = producto.id
       const clone = templateCard.cloneNode(true)
       fragment.appendChild(clone)
    })
    cards.appendChild(fragment)
}

const addCart = e => {
   
    if (e.target.classList.contains('btn-outline-dark')) {
        
        setCart(e.target.parentElement)
    }
    e.stopPropagation()
}

const setCart = obj => {
    const product = {
        id: obj.querySelector('.btn-outline-dark').dataset.id,
        name: obj.querySelector('h5').textContent,
        price: obj.querySelector('p').textContent,
        cant: 1
    }
    if(cart.hasOwnProperty(product.id)){
        product.cant = cart[product.id].cant + 1
    }

    cart[product.id] = {...product}
    displayCart()
}

const displayCart = () => {
    itemsCart.innerHTML = ''
    Object.values(cart).forEach(product =>{
        templateCart.querySelector('th').textContent = product.id
        templateCart.querySelectorAll('td')[0].textContent = product.name
        templateCart.querySelectorAll('td')[1].textContent = product.cant
        templateCart.querySelector('.btn-info').dataset.id = product.id
        templateCart.querySelector('.btn-danger').dataset.id = product.id
        templateCart.querySelector('span').textContent = product.cant * product.price
    
        const clone = templateCart.cloneNode(true)
        fragment.appendChild(clone)
    })
    itemsCart.appendChild(fragment)
    displayCartFooter()

    localStorage.setItem('cart', JSON.stringify(cart))
}

const displayCartFooter = () => {
    footerCart.innerHTML = ''
    if(Object.keys(cart).length === 0){
        return footerCart.innerHTML = `
        <th scope="row" colspan="5">Carrito vacío con innerHTML</th>
        `
        
    }

    const totalCant = Object.values(cart).reduce((acc, {cant}) => acc + cant , 0)
    const totalPrice = Object.values(cart).reduce((acc, {cant, price}) => acc + cant * price, 0)
    
    templateFooter.querySelectorAll('td')[0].textContent = totalCant
    templateFooter.querySelector('span').textContent = totalPrice

    displayTotalCantNav(totalCant);

    const clone = templateFooter.cloneNode(true)
    fragment.append(clone)

    footerCart.appendChild(fragment)

    const btnCleanCart = document.getElementById('clean-cart')
    btnCleanCart.addEventListener('click', () => {
        cart = {}
        displayCart();
        displayTotalCantNav();
    })


}

const displayTotalCantNav = (totalCant) => {
    totalCantNav.textContent = totalCant;
}


const btnAction = e => {

    // accion de aumentar producto
    if(e.target.classList.contains('btn-info')) {
        const product = cart[e.target.dataset.id]
        product.cant++
        cart[e.target.dataset.id] = {...product}
        displayCart();
    }else if(e.target.classList.contains('btn-danger')){
        const product = cart[e.target.dataset.id]
        product.cant--
        if(product.cant === 0){
            delete cart[e.target.dataset.id]
        }
        displayCart();
    }

    e.stopPropagation()
}