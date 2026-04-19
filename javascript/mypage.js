window.fullProductData = [];

// 로그인 필요
document.addEventListener("DOMContentLoaded", function () {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
        const user = JSON.parse(loggedInUser);
        const nameEl = document.getElementById('mypage-username');
        if (nameEl) nameEl.textContent = `${user.username} 님`;

        fetch('products.json')
            .then(res => res.json())
            .then(data => {
                window.fullProductData = data.products;

                const orderlistSection = document.getElementById('orderlist-section');
                if (orderlistSection && orderlistSection.classList.contains('active')) {
                    if (typeof loadOrderlistHTML === 'function') loadOrderlistHTML();
                }

                const wishlistSection = document.getElementById('wishlist-section');
                if (wishlistSection && wishlistSection.classList.contains('active')) {
                    if (typeof loadWishlistHTML === 'function') loadWishlistHTML();
                }
            })
            .catch(e => console.error("상품 데이터 로드 실패:", e));
    } else {
        alert("로그인이 필요합니다.");
        location.href = "ProjectPokemonGoodsShop.html";
    }

    let activeSection = window.location.hash.substring(1); 
    
    if (!activeSection) {
        activeSection = 'dashboard';
    }

    const targetBtn = document.querySelector(`button[onclick*="'${activeSection}'"]`);
    showSection(activeSection, targetBtn);

    // 선택 삭제
    const deleteSelBtn = document.getElementById('wish-delete-selected');
    if (deleteSelBtn) {
        deleteSelBtn.addEventListener('click', () => {
            if (typeof deleteSelectedWishlist === 'function') deleteSelectedWishlist();
        });
    }
});

// 대시보드에서 선택한 메뉴 보이기
function showSection(sectionId, btn) {
    document.querySelectorAll('.mypage-section').forEach(el => {
        el.classList.remove('active');
        el.style.display = 'none';
    });

    // 선택한 메뉴
    const target = document.getElementById(`${sectionId}-section`);
    if (target) {
        target.classList.add('active');
        target.style.display = 'block';
    }

    document.querySelectorAll('.list-group-item').forEach(el => {
        el.classList.remove('active');
    });

    if (btn) {
        btn.classList.add('active');
    } else {
        const fallbackBtn = document.querySelector(`button[onclick*="'${sectionId}'"]`);
        if(fallbackBtn) fallbackBtn.classList.add('active');
    }
    
    // 새로고침해도 페이지 이동 없게
    if(window.location.hash.substring(1) !== sectionId) {
        window.location.hash = sectionId;
    }

    // 주문내역
    if (sectionId === 'orderlist') {
        if (typeof loadOrderlistHTML === 'function') loadOrderlistHTML();
    }

    // 위시리스트
    if (sectionId === 'wishlist') {
        if (typeof loadWishlistHTML === 'function') loadWishlistHTML();
    }
}