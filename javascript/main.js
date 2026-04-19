const MAIN_PAGE_FILENAME = 'ProjectPokemonGoodsShop.html';

const TARGET_SECTION_ID = 'search-section';

window.products = [];
window.allProducts = []; // 검색 시 원본 데이터 보존
const itemsPerPage = 12;
let currentPage = 1;

document.addEventListener('DOMContentLoaded', () => {
    fetch('products.json')
        .then(response => response.json())
        .then(data => {
            window.allProducts = data.products; // 원본 데이터 보존
            window.products = window.allProducts; // 현재 표시할 데이터
            console.log("데이터 로드 성공: ", window.products);

            const savedCategory = sessionStorage.getItem('selectedCategory');

            const path = window.location.pathname;
            const isMainPage = path.includes(MAIN_PAGE_FILENAME) || path === '/' || path.endsWith('index.html');

            if (isMainPage) {
                if (savedCategory) {
                    const categoryData = JSON.parse(savedCategory);

                    sessionStorage.removeItem('selectedCategory');

                    if (categoryData.type === 'gen') {
                        filterByGen(categoryData.value, true);
                    } else if (categoryData.type === 'type') {
                        filterByType(categoryData.value, true);
                    }
                } else {
                    if (typeof setupPaginationEvents === 'function') setupPaginationEvents();
                    sortProducts(); 
                }
            }
        })
        .catch(error => console.error('Error loading JSON:', error));

    // 검색 
    const searchForm = document.querySelector('form[role="search"]');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = document.getElementById('exampleDataList').value.toLowerCase();

            window.products = window.allProducts.filter(p =>
                p.productname.toLowerCase().includes(query)
            );

            sortProducts();
        });
    }
});

// 정렬
window.sortProducts = function() {
    const sortValue = document.getElementById('product-sort')?.value || 'id_asc';

    window.products.sort((a, b) => {
        switch (sortValue) {
            case 'id_asc': // 기본 - 상품코드순
                return a.productid - b.productid;
            case 'name_asc': // 상품명순
                return a.productname.localeCompare(b.productname);
            case 'price_asc': // 낮은가격순
                return a.productprice - b.productprice;
            case 'price_desc': // 높은가격순
                return b.productprice - a.productprice;
            default: 
                return 0;
        }
    });

    // 정렬 후 1페이지로 이동
    currentPage = 1;
    if (typeof renderProducts === 'function') {
        renderProducts(currentPage);
        updatePaginationButtons();
    }
}

// 검색란 밑으로 보이게
function scrollToSearchSection() {
    const section = document.getElementById(TARGET_SECTION_ID);
    if (section) {
        setTimeout(() => {
            section.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }
}

// 카테고리(세대별)
function filterByGen(gen, shouldScroll = true) {
    const path = window.location.pathname;
    const isMainPage = path.includes(MAIN_PAGE_FILENAME) || path === '/' || path.endsWith('index.html');

    // 현재 다른 페이지에 있을 경우
    if (!isMainPage) {
        sessionStorage.setItem('selectedCategory', JSON.stringify({ type: 'gen', value: gen }));
        
        location.href = MAIN_PAGE_FILENAME; 
        return;  // 이동
    }

    // 현재 메인페이지일 경우
    if (gen === 'all') {
        window.products = window.allProducts;
    } else {
        window.products = window.allProducts.filter(p => p.productgen == gen);
    }

    sortProducts();

    closeOffcanvas();

    if (shouldScroll) {
        scrollToSearchSection();
    }
}

// 카테고리(타입별)
function filterByType(type, shouldScroll = true) {
    const path = window.location.pathname;
    const isMainPage = path.includes(MAIN_PAGE_FILENAME) || path === '/' || path.endsWith('index.html');

    // 현재 다른 페이지에 있을 경우
    if (!isMainPage) {
        sessionStorage.setItem('selectedCategory', JSON.stringify({ type: 'type', value: type }));
        
        location.href = MAIN_PAGE_FILENAME;
        return; // 이동
    }

    // 현재 메인페이지일 경우
    if (type === 'all') {
        window.products = window.allProducts;
    } else {
        window.products = window.allProducts.filter(p =>
            Array.isArray(p.producttype) ? p.producttype.includes(type) : p.producttype === type
        );
    }

    sortProducts();

    closeOffcanvas();

    if (shouldScroll) {
        scrollToSearchSection();
    }
}

// 검색 자동완성
fetch('products.json')
    .then(response => response.json())
    .then(data => {
        const dataList = document.getElementById('datalistOptions');
        if (dataList) {
            dataList.innerHTML = '';
            data.products.forEach(product => {
                const option = document.createElement('option');
                option.value = product.productname;
                dataList.appendChild(option);
            });
        }
    })
    .catch(error => console.error('오류:', error));

// 카테고리 오프캔버스 닫기
function closeOffcanvas() {
    const offcanvasElement = document.getElementById('offcanvasTop');
    if (offcanvasElement && typeof bootstrap !== 'undefined') {
        const offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvasElement);
        if (offcanvasInstance) offcanvasInstance.hide();
    }
}