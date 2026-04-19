// 한 화면에 10 페이지씩 표시
const maxPageButtons = 10;

function changePage(page) {
    const totalPages = Math.ceil(products.length / itemsPerPage) || 1;

    // 첫 페이지 1로 설정
    if (page < 1) page = 1;

    // 마지막 페이지 총 페이지로 설정
    if (page > totalPages) page = totalPages;

    currentPage = page;
    renderProducts(currentPage);

    updatePaginationButtons();
    if (typeof scrollToSearchSection === 'function') {
        scrollToSearchSection();
    }
}

// 버튼마다 이벤트 연결
function setupPaginationEvents() {

    const allPrevBtn = document.querySelector('.allprev-button');
    const prevBtn = document.querySelector('.prev-button');
    const nextBtn = document.querySelector('.next-button');
    const allNextBtn = document.querySelector('.allnext-button');

    // 맨 처음
    if (allPrevBtn) allPrevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        changePage(1);
    });

    // 이전 (현재 - 1)
    if (prevBtn) prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        changePage(currentPage - 1);
    });

    // 다음 (현재 + 1)
    if (nextBtn) nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        changePage(currentPage + 1);
    });

    // 맨 끝
    if (allNextBtn) allNextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const lastPage = Math.ceil(products.length / itemsPerPage);
        changePage(lastPage);
    });
}

// 페이지네이션 버튼
function updatePaginationButtons() {
    const totalPages = Math.ceil(products.length / itemsPerPage);
    const numberContainer = document.getElementById('number-button-wrapper');

    const prevBtn = document.querySelector('.prev-button')?.parentElement;
    const nextBtn = document.querySelector('.next-button')?.parentElement;
    const allPrevBtn = document.querySelector('.allprev-button')?.parentElement;
    const allNextBtn = document.querySelector('.allnext-button')?.parentElement;

    // 이전 버튼 비활성화
    if (currentPage === 1) {
        prevBtn?.classList.add('disabled');
        allPrevBtn?.classList.add('disabled');
    } else {
        prevBtn?.classList.remove('disabled');
        allPrevBtn?.classList.remove('disabled');
    }

    // 다음 버튼 비활성화
    if (currentPage === totalPages) {
        nextBtn?.classList.add('disabled');
        allNextBtn?.classList.add('disabled');
    } else {
        nextBtn?.classList.remove('disabled');
        allNextBtn?.classList.remove('disabled');
    }

    // 번호 버튼
    if (numberContainer) {
        numberContainer.innerHTML = '';

        // 첫 페이지 끝 페이지
        // 10개씩 보여줄 때, 현재 - 5 ~ 현재 + 4 -> 현재 페이지를 중간에 배치
        let startPage = currentPage - Math.floor(maxPageButtons / 2);
        let endPage = startPage + maxPageButtons - 1;

        if (startPage < 1) {
            startPage = 1;
            endPage = maxPageButtons;
        }

        // 마지막 페이지 근처일 경우
        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = totalPages - maxPageButtons + 1;
            if (startPage < 1) startPage = 1;
        }

        for (let i = startPage; i <= endPage; i++) {
            const activeClass = (i === currentPage) ? 'active' : '';

            const pageItem = `
                <li class="page-item ${activeClass}">
                    <a class="page-link" href="#" onclick="event.preventDefault(); changePage(${i});">${i}</a>
                </li>
            `;
            numberContainer.insertAdjacentHTML('beforeend', pageItem);
        }
    }
}