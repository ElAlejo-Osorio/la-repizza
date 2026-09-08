// js/app.js
// Lógica de Renderizado Dinámico y Conversión - La Repizza Oficial

document.addEventListener("DOMContentLoaded", () => {
    // 1. Inyección de dependencias del DOM
    const contenedorFiltros = document.querySelector(".categorias-filtros");
    const contenedorProductos = document.getElementById("contenedor-productos");
    const botonesFiltro = document.querySelectorAll(".btn-filtro");
    const contenedorSubcategorias = document.getElementById("subcategorias-pizzas");
    const botonesSubfiltro = document.querySelectorAll(".btn-subfiltro");
    const numeroWhatsApp = "573052131971"; // Número oficial del negocio

    // Estado global de filtrado
    let categoriaActual = "todos";
    let subcategoriaActual = "todas";

    // Observador de intersección para el efecto "Scroll Reveal"
    const observadorReveal = new IntersectionObserver((entradas) => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                entrada.target.classList.add("reveal-visible");
                observadorReveal.unobserve(entrada.target); // Se ejecuta una sola vez por tarjeta
            }
        });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

    /**
     * Renders el catálogo de productos en el contenedor HTML
     * @param {Array} listaProductos - Arreglo de objetos de productos
     */
    function renderizarCatalogo(listaProductos) {
        // Limpieza eficiente del contenedor para evitar fugas de memoria
        contenedorProductos.innerHTML = "";

        if (listaProductos.length === 0) {
            contenedorProductos.innerHTML = `
                <div class="sin-productos">
                    <p>Muy pronto añadiremos deliciosos platos a esta categoría. ¡Mantente atento!</p>
                </div>
            `;
            return;
        }

        // Iteración y construcción semántica de tarjetas
        listaProductos.forEach((producto, indice) => {
            // Formateo de precio estándar para Colombia (COP)
            // Algunos productos (ej. Cervezas, Cocteles) no tienen un precio único,
            // sino varias opciones detalladas en la descripción — evitamos mostrar "$0"
            const tienePrecioFijo = producto.precio > 0;
            const precioFormateado = tienePrecioFijo
                ? new Intl.NumberFormat('es-CO', {
                    style: 'currency',
                    currency: 'COP',
                    minimumFractionDigits: 0
                }).format(producto.precio)
                : "Consulta precios";

            // Preparación del mensaje de conversión para WhatsApp
            const textoMensaje = tienePrecioFijo
                ? `¡Hola La Repizza! Me gustaría ordenar el producto: *${producto.nombre}* (${precioFormateado}).`
                : `¡Hola La Repizza! Me gustaría saber más sobre: *${producto.nombre}*.`;
            const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(textoMensaje)}`;

            // Creación del nodo de la tarjeta
            const card = document.createElement("div");
            card.classList.add("producto-card", "reveal");
            // Efecto escalonado: las tarjetas visibles a la vez no aparecen todas de golpe
            card.style.transitionDelay = `${(indice % 3) * 0.12}s`;

            card.innerHTML = `
                <div class="producto-img-container">
                    <img src="${producto.imagen}" alt="${producto.nombre}" loading="lazy">
                </div>
                <div class="producto-info">
                    <h3>${producto.nombre}</h3>
                    <p class="descripcion">${producto.descripcion}</p>
                    <div class="producto-footer">
                        <span class="precio">${precioFormateado}</span>
                        <a href="${urlWhatsApp}" target="_blank" rel="noopener noreferrer" class="btn-pedir">
                            <i class="fa-brands fa-whatsapp"></i> ${tienePrecioFijo ? "Pedir" : "Consultar"}
                        </a>
                    </div>
                </div>
            `;
            
            contenedorProductos.appendChild(card);
            observadorReveal.observe(card);

            // Retira el skeleton de carga en cuanto la imagen real esté lista (o si falla, para no dejarlo pulsando)
            const imgProducto = card.querySelector(".producto-img-container img");
            const contenedorImg = card.querySelector(".producto-img-container");
            if (imgProducto.complete) {
                contenedorImg.classList.add("img-cargada");
            } else {
                imgProducto.addEventListener("load", () => contenedorImg.classList.add("img-cargada"));
                imgProducto.addEventListener("error", () => contenedorImg.classList.add("img-cargada"));
            }
        });
    }

    /**
     * Aplica el filtro combinado por categoría y subcategoría
     */
    function aplicarFiltros() {
        const productosFiltrados = productosMenu.filter(producto => {
            const coincideCat = (categoriaActual === "todos") || (producto.categoria === categoriaActual);
            const coincideSubcat = (subcategoriaActual === "todas") || (producto.subcategoria === subcategoriaActual);

            return coincideCat && coincideSubcat;
        });

        renderizarCatalogo(productosFiltrados);
    }

    /**
     * Posiciona el indicador deslizante detrás del botón de filtro activo
     * @param {HTMLElement} boton - Botón sobre el que debe posicionarse el indicador
     */
    function moverIndicadorFiltro(boton) {
        if (!indicadorFiltro || !boton) return;
        indicadorFiltro.style.width = `${boton.offsetWidth}px`;
        indicadorFiltro.style.height = `${boton.offsetHeight}px`;
        indicadorFiltro.style.left = `${boton.offsetLeft}px`;
        indicadorFiltro.style.top = `${boton.offsetTop}px`;
    }

    // Indicador visual deslizante detrás del filtro activo (efecto premium tipo pill)
    const indicadorFiltro = document.createElement("div");
    indicadorFiltro.classList.add("filtro-indicador");
    if (contenedorFiltros) {
        contenedorFiltros.prepend(indicadorFiltro);
    }

    // Overlay oscuro detrás del drawer de navegación mobile
    const overlayMenu = document.createElement("div");
    overlayMenu.classList.add("menu-overlay");
    document.body.appendChild(overlayMenu);

    /**
     * Gestiona el evento de filtrado por categoría principal
     */
    botonesFiltro.forEach(boton => {
        boton.addEventListener("click", (e) => {
            botonesFiltro.forEach(btn => btn.classList.remove("activo"));
            e.target.classList.add("activo");
            moverIndicadorFiltro(e.target);
            e.target.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });

            categoriaActual = e.target.dataset.categoria;

            // Muestra u oculta la barra de subcategorías al elegir 'pizzas'
            if (categoriaActual === "pizzas") {
                if (contenedorSubcategorias) contenedorSubcategorias.style.display = "flex";
            } else {
                if (contenedorSubcategorias) contenedorSubcategorias.style.display = "none";
                subcategoriaActual = "todas"; // Resetea subcategoría al cambiar de pestaña

                // Reinicia estado activo en subbotones
                botonesSubfiltro.forEach(btn => btn.classList.remove("activo"));
                const btnSubTodas = document.querySelector('.btn-subfiltro[data-subcategoria="todas"]');
                if (btnSubTodas) btnSubTodas.classList.add("activo");
            }

            aplicarFiltros();
        });
    });

    /**
     * Gestiona el evento de filtrado por subcategoría (pizzas)
     */
    botonesSubfiltro.forEach(boton => {
        boton.addEventListener("click", (e) => {
            botonesSubfiltro.forEach(btn => btn.classList.remove("activo"));
            e.target.classList.add("activo");
            e.target.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });

            subcategoriaActual = e.target.dataset.subcategoria;
            aplicarFiltros();
        });
    });

    // Reposiciona el indicador si el usuario cambia el tamaño de la ventana
    window.addEventListener("resize", () => {
        const activo = document.querySelector(".btn-filtro.activo");
        moverIndicadorFiltro(activo);
    });

    // Inicialización de la aplicación: Carga inicial de todo el menú
    renderizarCatalogo(productosMenu);

    // Posición inicial del indicador sobre "Todos"
    moverIndicadorFiltro(document.querySelector(".btn-filtro.activo"));

    // 2. Navbar dinámica: transparente arriba, sólida con blur al hacer scroll
    const navbar = document.querySelector(".navbar");
    const botonFlotante = document.querySelector(".btn-whatsapp-flotante");
    const botonSubirMenu = document.getElementById("btnSubirMenu");
    const seccionMenu = document.getElementById("menu");
    const UMBRAL_SCROLL = 60;

    function gestionarScroll() {
        const haHechoScroll = window.scrollY > UMBRAL_SCROLL;

        if (navbar) {
            navbar.classList.toggle("navbar-scrolled", haHechoScroll);
        }

        if (botonFlotante) {
            botonFlotante.classList.toggle("visible", haHechoScroll);
        }

        // El botón "volver al menú" solo aparece una vez que el usuario
        // efectivamente entró a esa sección (útil sobre todo en categorías largas como Pizzas)
        if (botonSubirMenu && seccionMenu) {
            const yaEntroAlMenu = window.scrollY >= seccionMenu.offsetTop - 100;
            botonSubirMenu.classList.toggle("visible", yaEntroAlMenu);
        }
    }

    window.addEventListener("scroll", gestionarScroll);
    gestionarScroll(); // Estado correcto si la página carga ya con scroll

    // 3. Microinteracción de parallax/tilt en la imagen del Hero (solo dispositivos con mouse)
    const heroImagen = document.querySelector(".hero-imagen");
    const soportaHover = window.matchMedia("(pointer: fine)").matches;

    if (heroImagen && soportaHover) {
        const hero = document.querySelector(".hero");

        hero.addEventListener("mousemove", (e) => {
            const rect = hero.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;

            heroImagen.style.transform = `rotateY(${x * 6}deg) rotateX(${y * -6}deg)`;
        });

        hero.addEventListener("mouseleave", () => {
            heroImagen.style.transform = "rotateY(0deg) rotateX(0deg)";
        });
    }

    // 4. Menú hamburguesa (mobile): drawer deslizante con overlay
    const botonMenuToggle = document.getElementById("menuToggle");
    const menuNav = document.getElementById("navMenu");
    const iconoMenuToggle = botonMenuToggle ? botonMenuToggle.querySelector("i") : null;

    function abrirMenuMobile() {
        menuNav.classList.add("menu-abierto");
        overlayMenu.classList.add("activo");
        botonMenuToggle.setAttribute("aria-expanded", "true");
        if (iconoMenuToggle) {
            iconoMenuToggle.classList.remove("fa-bars");
            iconoMenuToggle.classList.add("fa-xmark");
        }
        document.body.style.overflow = "hidden"; // Evita scroll de fondo con el drawer abierto
        if (botonFlotante) {
            botonFlotante.classList.remove("visible"); // Evita que quede flotando sobre el drawer (z-index más alto)
        }
        if (botonSubirMenu) {
            botonSubirMenu.classList.remove("visible");
        }
    }

    function cerrarMenuMobile() {
        menuNav.classList.remove("menu-abierto");
        overlayMenu.classList.remove("activo");
        botonMenuToggle.setAttribute("aria-expanded", "false");
        if (iconoMenuToggle) {
            iconoMenuToggle.classList.remove("fa-xmark");
            iconoMenuToggle.classList.add("fa-bars");
        }
        document.body.style.overflow = "";
        if (botonFlotante && window.scrollY > UMBRAL_SCROLL) {
            botonFlotante.classList.add("visible"); // Vuelve a aparecer si ya se había ganado su aparición por scroll
        }
        if (botonSubirMenu && seccionMenu && window.scrollY >= seccionMenu.offsetTop - 100) {
            botonSubirMenu.classList.add("visible");
        }
    }

    if (botonMenuToggle && menuNav) {
        botonMenuToggle.addEventListener("click", () => {
            const estaAbierto = menuNav.classList.contains("menu-abierto");
            estaAbierto ? cerrarMenuMobile() : abrirMenuMobile();
        });

        // Cerrar al tocar el fondo oscuro
        overlayMenu.addEventListener("click", cerrarMenuMobile);

        // Cerrar automáticamente al elegir una sección (mejor UX que dejarlo abierto)
        menuNav.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", cerrarMenuMobile);
        });

        // Si el usuario gira el celular o cambia a escritorio, evitar estado inconsistente
        window.addEventListener("resize", () => {
            if (window.innerWidth > 768) {
                cerrarMenuMobile();
            }
        });
    }
});