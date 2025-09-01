// 전역 변수
const API_BASE_URL = 'http://localhost:8080'
let editingBookId = null // 현재 수정 중인 도서 ID

// DOM 요소 참조
const bookForm = document.getElementById('bookForm')
const bookTableBody = document.getElementById('bookTableBody')
const submitButton = bookForm.querySelector('button[type="submit"]')
const cancelButton = bookForm.querySelector('.cancel-btn')
const formError = document.getElementById('formError')

// 초기화
document.addEventListener('DOMContentLoaded', function () {
    console.log('페이지 로드 완료')
    loadBooks()
})

// 폼 제출 이벤트 핸들러
bookForm.addEventListener('submit', async function (e) {
    e.preventDefault()
    
    // 폼 데이터 수집
    const formData = new FormData(bookForm)
    const bookData = {
        title: formData.get('title').trim(),
        author: formData.get('author').trim(),
        isbn: formData.get('isbn').trim(),
        price: formData.get('price') ? parseInt(formData.get('price')) : null,
        publishDate: formData.get('publishDate') || null,
        bookDetail: {
            description: formData.get('description') ? formData.get('description').trim() : '',
            language: formData.get('language') ? formData.get('language').trim() : '',
            pageCount: formData.get('pageCount') ? parseInt(formData.get('pageCount')) : null,
            publisher: formData.get('publisher') ? formData.get('publisher').trim() : '',
            edition: formData.get('edition') ? formData.get('edition').trim() : '',
            coverImageUrl: formData.get('coverImageUrl') ? formData.get('coverImageUrl').trim() : '',
        }
    }

    try {
        setLoading(true)
        if (editingBookId) {
            await updateBook(editingBookId, bookData)
        } else {
            await createBook(bookData)
        }
    } catch (error) {
        console.error('폼 제출 오류:', error)
        showError(error.message)
    } finally {
        setLoading(false)
    }
})

// 도서 목록 로드
async function loadBooks() {
    clearMessages()
    setLoading(true)
    try {
        const response = await fetch(`${API_BASE_URL}/api/books`)
        if (!response.ok) throw new Error('데이터를 불러오는 데 실패했습니다.')
        const books = await response.json()
        renderBooks(books)
    } catch (error) {
        console.error('도서 목록 로드 실패:', error)
        showError('도서 목록을 불러올 수 없습니다. 서버 상태를 확인하세요.')
        renderEmptyTable()
    } finally {
        setLoading(false)
    }
}

// 도서 등록
async function createBook(bookData) {
    const response = await fetch(`${API_BASE_URL}/api/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookData),
    })
    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '도서 등록에 실패했습니다.')
    }
    showSuccess('도서가 성공적으로 등록되었습니다.')
    resetForm()
    await loadBooks()
}

// 도서 수정
async function updateBook(id, bookData) {
    const response = await fetch(`${API_BASE_URL}/api/books/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookData),
    })
    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '도서 수정에 실패했습니다.')
    }
    showSuccess('도서가 성공적으로 수정되었습니다.')
    resetForm()
    await loadBooks()
}

// 도서 삭제 (전역 함수)
window.deleteBook = async function (id, title) {
    if (!confirm(`'${title}' 도서를 정말로 삭제하시겠습니까?`)) {
        return
    }
    setLoading(true)
    try {
        const response = await fetch(`${API_BASE_URL}/api/books/${id}`, {
            method: 'DELETE',
        })
        if (!response.ok) throw new Error('도서 삭제에 실패했습니다.')
        showSuccess('도서가 성공적으로 삭제되었습니다.')
        await loadBooks()
    } catch (error) {
        console.error('도서 삭제 실패:', error)
        showError(error.message)
    } finally {
        setLoading(false)
    }
}

// 도서 편집 (전역 함수)
window.editBook = async function (id) {
    clearMessages()
    try {
        const response = await fetch(`${API_BASE_URL}/api/books/${id}`)
        if (!response.ok) throw new Error('도서 정보를 불러오지 못했습니다.')
        const book = await response.json()
        fillForm(book)
        editingBookId = id
        submitButton.textContent = '도서 수정'
        cancelButton.style.display = 'inline-block'
    } catch (error) {
        console.error('도서 정보 로드 실패:', error)
        showError(error.message)
    }
}

// 폼에 도서 데이터 채우기
function fillForm(book) {
    bookForm.elements['title'].value = book.title || ''
    bookForm.elements['author'].value = book.author || ''
    bookForm.elements['isbn'].value = book.isbn || ''
    bookForm.elements['price'].value = book.price || ''
    bookForm.elements['publishDate'].value = book.publishDate || ''
    if (book.bookDetail) {
        bookForm.elements['description'].value = book.bookDetail.description || ''
        bookForm.elements['language'].value = book.bookDetail.language || ''
        bookForm.elements['pageCount'].value = book.bookDetail.pageCount || ''
        bookForm.elements['publisher'].value = book.bookDetail.publisher || ''
        bookForm.elements['edition'].value = book.bookDetail.edition || ''
        bookForm.elements['coverImageUrl'].value = book.bookDetail.coverImageUrl || ''
    }
}

// 테이블에 도서 목록 렌더링
function renderBooks(books) {
    bookTableBody.innerHTML = ''
    if (books.length === 0) {
        renderEmptyTable()
        return
    }
    books.forEach(book => {
        const row = document.createElement('tr')
        row.innerHTML = `
            <td>${book.title || '-'}</td>
            <td>${book.author || '-'}</td>
            <td>${book.isbn || '-'}</td>
            <td>${book.price || '-'}</td>
            <td>${book.publishDate || '-'}</td>
            <td>${book.bookDetail?.publisher || '-'}</td>
            <td class="action-buttons">
                <button onclick="editBook(${book.id})">수정</button>
                <button onclick="deleteBook(${book.id}, '${book.title}')">삭제</button>
            </td>
        `
        bookTableBody.appendChild(row)
    })
}

// 빈 테이블 렌더링
function renderEmptyTable() {
    bookTableBody.innerHTML = `
        <tr>
            <td colspan="7" style="text-align: center;">등록된 도서가 없습니다.</td>
        </tr>
    `
}

// 폼 초기화
function resetForm() {
    bookForm.reset()
    editingBookId = null
    submitButton.textContent = '도서 등록'
    cancelButton.style.display = 'none'
    clearMessages()
}

// 에러 메시지 표시
function showError(message) {
    formError.textContent = message
    formError.className = 'error-message visible'
}

// 성공 메시지 표시
function showSuccess(message) {
    formError.textContent = message
    formError.className = 'success-message visible'
}

// 메시지 초기화
function clearMessages() {
    formError.textContent = ''
    formError.className = 'error-message'
}

// 로딩 상태 표시
function setLoading(isLoading) {
    if (isLoading) {
        submitButton.disabled = true
        submitButton.textContent = editingBookId ? '수정 중...' : '등록 중...'
        cancelButton.disabled = true
    } else {
        submitButton.disabled = false
        submitButton.textContent = editingBookId ? '도서 수정' : '도서 등록'
        cancelButton.disabled = false
    }
}

// 취소 버튼 이벤트
cancelButton.addEventListener('click', resetForm)