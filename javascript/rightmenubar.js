document.addEventListener('DOMContentLoaded', () => {
    const rightMenuHtml = `
        <aside id="rightmenu">
            <ul>
                <li>
                    <button onclick="goToWishlist()">
                        <span class="menuicon">💗</span>
                        <span>위시리스트</span>
                    </button>
                </li>
                <li>
                    <button onclick="goToevent()">
                        <span class="menuicon">🎁</span>
                        <span>이벤트</span>
                    </button>
                </li>
                <li>
                    <button onclick="goTofaq()">
                        <span class="menuicon">❓</span>
                        <span>FAQ</span>
                    </button>
                </li>
                <li>
                    <button onclick="goToboard()">
                        <span class="menuicon">📋</span>
                        <span>게시판</span>
                    </button>
                </li>
                <li>
                    <button onclick="window.scrollTo({top: 0, behavior: 'smooth'})">
                        <span class="menuicon">⬆️</span>
                        <span>TOP</span>
                    </button>
                </li>
            </ul>
        </aside>
    `;

    document.body.insertAdjacentHTML('beforeend', rightMenuHtml);
});

// 위시리스트
function goToWishlist() {
    const user = localStorage.getItem('loggedInUser');
    if (!user) {
        alert("로그인이 필요한 서비스입니다.");
        return;
    }

    // 마이페이지일 경우
    if (window.location.pathname.includes('mypage.html')) {
        if (typeof showSection === 'function') {
            showSection('wishlist');
            window.location.hash = 'wishlist';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            location.href = 'mypage.html#wishlist';
        }
    } else {
        location.href = 'mypage.html#wishlist';
    }
}

// FAQ
function goTofaq() {
    alert("FAQ 페이지가 준비 중입니다.");
}

// 게시판
function goToboard() {
    alert("게시판 페이지가 준비 중입니다.");
}

// 이벤트
function goToevent() {
    alert("이벤트 페이지가 준비 중입니다.");
}