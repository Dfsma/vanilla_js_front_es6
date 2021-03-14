// Inicio urls apis //
const baseUrl = "https://bsale-test-cl.herokuapp.com/api/v1/";
const productsUrl = "https://bsale-test-cl.herokuapp.com/api/v1/products/";
const categoriesUrl = "https://bsale-test-cl.herokuapp.com/api/v1/categories";
// Inicio urls apis //

// Inicio de la obtencion de elementos html para obtener su valores //
const cards = document.getElementById("cards");
const totalCantNav = document.getElementById("total-count");
const itemsCart = document.getElementById("items");
const footerCart = document.getElementById("footer-cart");
const templateCard = document.getElementById("template-card").content;
const templateCart = document.getElementById("template-cart").content;
const templateFooter = document.getElementById("template-footer").content;
const categoriesDropDown = document.getElementById("categoryDropDown");
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const allSubmit = document.getElementById("all-submit");
let liElements = document.getElementById("nav-pagination");
const loader = document.querySelector("#loading");
const loadingDiv = document.getElementById('loading');
// Fin de la obtencion de elementos html para obtener su valores // 


const fragment = document.createDocumentFragment();

let cart = {};

document.addEventListener("DOMContentLoaded", () => {

  fetchProducts();
  fetchCategories();
  

  if (localStorage.getItem("cart")) {
    cart = JSON.parse(localStorage.getItem("cart"));
    displayCart();
  }
});

liElements.addEventListener("click", (e) => {
    paginaSeleccionada = e.target.innerText;
    fetchProductsByPagination(paginaSeleccionada);
  });

allSubmit.addEventListener("click", (e) => {
  clear();
  fetchProducts();
});

searchInput.addEventListener("change", (e) => {
  const query = searchInput.value;
  fetchProductsBySearchParam(query);
});

categoriesDropDown.addEventListener("change", (e) => {
  fetchProductsByCategory(e.target.value);
});

cards.addEventListener("click", (e) => {
  addCart(e);
});

items.addEventListener("click", (e) => {
  btnAction(e);
});


const showSpinner = () => {
  loadingDiv.style.visibility = 'visible';
}
const hideSpinner = () => {
  loadingDiv.style.visibility = 'hidden';
}



const fetchProducts = async () => {
  showSpinner();
  try {
    const response = await fetch(productsUrl);
    const data = await response.json();
    console.log(data)
    if(data){
      displayCard(data);
      displayPagination(data);
      
    }
    hideSpinner();
    
    
  } catch (error) {
    console.log(error);
  }
  
};

const fetchCategories = async () => {
  showSpinner();
  try {
    const response = await fetch(categoriesUrl);
    const data = await response.json();
    if(data){
      displayCategories(data);
    }
    hideSpinner();
    
  } catch (error) {
    console.log(error);
  }
};

const fetchProductsBySearchParam = async (query) => {
  showSpinner();
  try {
    const response = await fetch(baseUrl + `/searchs?query=${query}`);
    const data = await response.json();
    clear();
    if(data){
      displayCard(data);
    }
    hideSpinner();
  } catch (error) {
    console.log(error);
  }
};

const fetchProductsByCategory = async (selectedOption) => {
  showSpinner();
  try {
    const response = await fetch(categoriesUrl + `/${selectedOption}`);
    const data = await response.json();
    clear();
    if(data){
      displayCard(data);
    }
    hideSpinner();
  } catch (error) {
    console.log(error);
  }
};

const fetchProductsByPagination = async (page) => {
  showSpinner();
  try {
    const response = await fetch(productsUrl + `/page` + `/${page}`);
    const data = await response.json();
    clear();
    if(data){
      displayCard(data);
    }
    hideSpinner();
  } catch (error) {
    console.log(error);
  }
};

const displayCategories = (data) => {
  const html = data.data
    .map((categoria) => {
      return `
            <option id="category" value="${categoria.id}">${categoria.name}</option>
        `;
    })
    .join("");
  document
    .querySelector("#categoryDropDown")
    .insertAdjacentHTML("beforeend", html);
};

const displayPagination = (data) => {

  const totalPageCount = Math.ceil(data.data.length / 4);
  let numbers = [];

  for (let index = 1; index < totalPageCount; index++) {
    numbers.push(index);
  }

  const html = numbers
    .map((number) => {
      return `  
        <li  id="page-items" class="page-item" >        
            <a  id="page-links" class="page-link"  value=${number}>${number}</a>            
        </li>      
        
        `;
    })
    .join("");
  document.querySelector("#pagination").innerHTML = html;

};


const displayCard = (data) => {
  data.data.map((producto) => {
    templateCard.querySelector("img").setAttribute("src", producto.url_image);
    templateCard.querySelector("h5").textContent = producto.name;
    templateCard.querySelector("p").textContent =  producto.price;
    templateCard.querySelector("#discount").textContent = producto.discount + " %";
    templateCard.querySelector(".fa-cart-plus").dataset.id = producto.id;
    const clone = templateCard.cloneNode(true);
    fragment.appendChild(clone);
  });
  cards.appendChild(fragment);
};

const addCart = (e) => {
  if (e.target.classList.contains("fa-cart-plus")) {
    setCart(e.target.parentElement);
  }
  e.stopPropagation();
};

const setCart = (obj) => {
  const product = {
    id: obj.querySelector(".fa-cart-plus").dataset.id,
    name: obj.querySelector("h5").textContent,
    price: obj.querySelector("p").textContent,
    cant: 1,
  };
  if (cart.hasOwnProperty(product.id)) {
    product.cant = cart[product.id].cant + 1;
  }

  cart[product.id] = { ...product };
  displayCart();
};

const displayCart = () => {
  itemsCart.innerHTML = "";
  Object.values(cart).forEach((product) => {
    templateCart.querySelector("th").textContent = product.id;
    templateCart.querySelectorAll("td")[0].textContent = product.name;
    templateCart.querySelectorAll("td")[1].textContent = product.cant;
    templateCart.querySelector(".btn-info").dataset.id = product.id;
    templateCart.querySelector(".btn-danger").dataset.id = product.id;
    templateCart.querySelector("span").textContent =
      product.cant * product.price;

    const clone = templateCart.cloneNode(true);
    fragment.appendChild(clone);
  });
  itemsCart.appendChild(fragment);
  displayCartFooter();

  localStorage.setItem("cart", JSON.stringify(cart));
};

const displayCartFooter = () => {
  footerCart.innerHTML = "";
  if (Object.keys(cart).length === 0) {
    return (footerCart.innerHTML = `
        <th scope="row" colspan="5">Carrito vacío</th>
        `);
  }

  const totalCant = Object.values(cart).reduce(
    (acc, { cant }) => acc + cant,
    0
  );
  const totalPrice = Object.values(cart).reduce(
    (acc, { cant, price }) => acc + cant * price,
    0
  );

  templateFooter.querySelectorAll("td")[0].textContent = totalCant;
  templateFooter.querySelector("span").textContent = totalPrice;

  displayTotalCantNav(totalCant);

  const clone = templateFooter.cloneNode(true);
  fragment.append(clone);

  footerCart.appendChild(fragment);

  const btnCleanCart = document.getElementById("clean-cart");
  btnCleanCart.addEventListener("click", () => {
    cart = {};
    displayCart();
    displayTotalCantNav();
  });
};

const displayTotalCantNav = (totalCant) => {
  totalCantNav.textContent = totalCant;
};

const btnAction = (e) => {
  // accion de aumentar producto
  if (e.target.classList.contains("btn-info")) {
    const product = cart[e.target.dataset.id];
    product.cant++;
    cart[e.target.dataset.id] = { ...product };
    displayCart();
  } else if (e.target.classList.contains("btn-danger")) {
    const product = cart[e.target.dataset.id];
    product.cant--;
    if (product.cant === 0) {
      delete cart[e.target.dataset.id];
    }
    displayCart();
  }

  e.stopPropagation();
};

const clear = () => {
  cards.innerHTML = "";
};
