const cards = document.getElementById('cards');
const items = document.getElementById('items');
const footer = document.getElementById('footer');
const templateCard = document.getElementById('template-card').content;
const templateCarrito = document.getElementById('template-carrito').content;
const templateFooter = document.getElementById('template-footer').content;
const fragment = document.createDocumentFragment();
const templateBuy = document.getElementById('template-comprar');

let carrito = {};

// 01- SIMULAR CONSUMIR UNA BASE DE DATOS USANDO EL JSON
document.addEventListener('DOMContentLoaded', () => {
    fetchData();
    if (localStorage.getItem('carrito')) {
        carrito = JSON.parse(localStorage.getItem('carrito'));
        mostrarCarrito();
    }
})

cards.addEventListener('click', e => {
    addCarrito(e);
})

items.addEventListener('click', e => {
    btnMasMenos(e);
})

const fetchData = async () => {
    try {
        // cambie la ruta para ver si se resuelve el problema anterior
        const res = await fetch('../scripts/api.json');
        const data = await res.json();
        pintarCards(data);
    } catch (error) {
        console.log('error al encontrar el archivo JSON');
    }
}

// 02- MOSTRAR EL HTML DE FORMA DINAMICA
const pintarCards = data => {
    data.forEach(producto => {
        templateCard.querySelector('h5').textContent = producto.titulo;
        templateCard.querySelector('p').textContent = producto.precio;
        templateCard.querySelector('img').setAttribute("src", producto.imagenUrl);
        templateCard.querySelector('.btn-dark').dataset.id = producto.id;
        // clonar el template
        const clone = templateCard.cloneNode(true);
        fragment.appendChild(clone);
    })
    // pasarlo al fragment
    cards.appendChild(fragment);
}
// 03- AGREGAR LOS ITEMS AL CARRITO
const addCarrito = (e) => {
    if (e.target.classList.contains('btn-dark')) {
        setCarrito(e.target.parentElement);
        Toastify({
            text: "Producto agregado!",
            duration: 1000,
            close: true,
            gravity: "top",
            position: "right",
            style: {
                background: "linear-gradient(to right, #023047, #001219)",
            },
        }).showToast();
    }
    // detener eventos heredados de padres
    e.stopPropagation();
}

// 04- SUMAMOS LOS ITEMS DEL CARRITO Y MOSTRAMOS
const setCarrito = objeto => {
    const producto = {
        id: objeto.querySelector('.btn-dark').dataset.id,
        titulo: objeto.querySelector('h5').textContent,
        precio: objeto.querySelector('p').textContent,
        cantidad: 1
    }
    // revisamos si el producto existe en el carrito, si esta lo aumentamos en 1
    if (carrito.hasOwnProperty(producto.id)) {
        producto.cantidad = carrito[producto.id].cantidad + 1;
    }
    // usamos spread operator para hacer una nueva copia y no modificar el array
    carrito[producto.id] = {
        ...producto
    }
    mostrarCarrito();
}
// mostramos los articulos en el carrito
const mostrarCarrito = () => {
    items.innerHTML = '';
    Object.values(carrito).forEach(producto => {
        templateCarrito.querySelector('th').textContent = producto.id;
        templateCarrito.querySelectorAll('td')[0].textContent = producto.titulo;
        templateCarrito.querySelectorAll('td')[1].textContent = producto.cantidad;
        templateCarrito.querySelector('.btn-info').dataset.id = producto.id;
        templateCarrito.querySelector('.btn-danger').dataset.id = producto.id;
        templateCarrito.querySelector('span').textContent = producto.cantidad * producto.precio;
        // clonar el template igual que el anterior
        const clone = templateCarrito.cloneNode(true);
        fragment.appendChild(clone);
    })
    items.appendChild(fragment);
    // limpiamos el contenido del footer
    mostrarFooter();
    // guardamos carrito en local storage
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

// 05- MOSTRAMOS LOS DATOS EN EL FOOTER CON EL RECUENTO
const mostrarFooter = () => {
    footer.innerHTML = '';
    if (Object.keys(carrito).length === 0) {
        footer.innerHTML = `<th scope="row" colspan="5">Su carrito esta vacio, empiece a hacer sus compras!</th>`;
        // hacer que no se sigan haciendo las operaciones
        return;
    }
    // calculamos la cantidad de productos
    const nCantidad = Object.values(carrito).reduce((acc, {
        cantidad
    }) => acc + cantidad, 0)
    // calculamos los precios de los productos
    const nPrecio = Object.values(carrito).reduce((acc, {
        cantidad,
        precio
    }) => acc + cantidad * precio, 0)
    templateFooter.querySelectorAll('td')[0].textContent = nCantidad;
    templateFooter.querySelector('span').textContent = nPrecio;

    const clone = templateFooter.cloneNode(true);
    fragment.appendChild(clone);
    footer.appendChild(fragment);

    const vaciarBtn = document.getElementById('vaciar-carrito');
    vaciarBtn.addEventListener('click', () => {
        carrito = {};
        mostrarCarrito();
    })
    const comprarProductos = document.getElementById('comprarProductos');
    comprarProductos.addEventListener('click', function () {
        Swal.fire({
                title: `El total de su compra sera de: $${nPrecio}, por los: ${nCantidad} productos`,
                text: "Precione 'OK' para realizar su pago",
                icon: "info",
                buttons: true,
            })
            .then((willDelete) => {
                if (willDelete) {
                    swal.fire("Bien! su compra ha sido realizada con exito", {
                        icon: "success",
                    });
                } else {
                    swal.fire("Your imaginary file is safe!");
                }
            });
    })
}

// 06- ELIMINAMOS ITEMS DEL CARRITO
const btnMasMenos = e => {
    // aumenta la cantidad del producto
    if (e.target.classList.contains('btn-info')) {
        const producto = carrito[e.target.dataset.id];
        producto.cantidad++;
        carrito[e.target.dataset.id] = {
            ...producto
        };
        mostrarCarrito();
    }
    // disminuye la cantidad del producto
    if (e.target.classList.contains('btn-danger')) {
        const producto = carrito[e.target.dataset.id];
        producto.cantidad--;
        if (producto.cantidad === 0) {
            delete carrito[e.target.dataset.id];
        }
        mostrarCarrito();
    }
    e.stopPropagation();
}