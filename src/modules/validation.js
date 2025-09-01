import { stringUtils } from "../utils/helpers";
// Destructuring assignment
const { isEmpty, safeTrim } = stringUtils;

// 유효성 검사 모듈
// 구조분해할당과 화살표 함수 사용

// 정규식 패턴들 - 각 필드의 유효한 형식을 정의
export const patterns = {
    // ISBN 형식 (예: 978-89-6077-733-1 또는 9788960777331)
    isbn: /^(?:(?=.{13}$)\d{3}[-\s]?\d{1,5}[-\s]?\d{1,7}[-\s]?\d{1,6}[-\s]?\d{1}|(?=.{10}$)\d{9}[\dXx])$/,
    // 가격 형식 (0 이상의 정수)
    price: /^\d+$/,
    // 이메일 형식
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    // 저자 이름 (한글, 영어 대소문자, 공백 허용)
    author: /^[가-힣a-zA-Z\s]+$/,
    // 출판일 형식 (YYYY-MM-DD)
    publishDate: /^\d{4}-\d{2}-\d{2}$/
}

// 에러 메시지들을 타입별로 분류하여 관리
export const messages = {
    // 필수 입력 필드가 비어있을 때 표시할 메시지들
    required: {
        title: '제목을 입력해주세요.',
        author: '저자를 입력해주세요.',
        isbn: 'ISBN을 입력해주세요.',
        price: '가격을 입력해주세요.',
        publishDate: '출판일을 입력해주세요.',
        description: '설명을 입력해주세요.',
        language: '언어를 입력해주세요.',
        pageCount: '페이지 수를 입력해주세요.'
    },

    // 입력 형식이 올바르지 않을 때 표시할 메시지들
    format: {
        isbn: '올바른 ISBN 형식이 아닙니다.',
        price: '가격은 0 이상의 숫자로 입력해주세요.',
        email: '올바른 이메일 형식이 아닙니다. 예: user@example.com',
        author: '저자 이름은 한글, 영문, 공백만 허용됩니다.',
        publishDate: '올바른 날짜 형식이 아닙니다. (YYYY-MM-DD)'
    }
}

// 개별 필드별 검증 함수들을 담은 객체 (화살표 함수 사용)
const validators = {
    // 제목(title) 필드 검증 함수
    title: (title) => {
        if (isEmpty(title)) {
            return {
                isValid: false,
                message: messages.required.title,
                field: 'title'
            }
        }
        return { isValid: true }
    },

    // 저자(author) 필드 검증 함수
    author: (author) => {
        if (isEmpty(author)) {
            return {
                isValid: false,
                message: messages.required.author,
                field: 'author'
            }
        }
        if (!patterns.author.test(safeTrim(author))) {
            return {
                isValid: false,
                message: messages.format.author,
                field: 'author'
            }
        }
        return { isValid: true }
    },

    // ISBN 필드 검증 함수
    isbn: (isbn) => {
        if (isEmpty(isbn)) {
            return {
                isValid: false,
                message: messages.required.isbn,
                field: 'isbn'
            }
        }
        if (!patterns.isbn.test(safeTrim(isbn))) {
            return {
                isValid: false,
                message: messages.format.isbn,
                field: 'isbn'
            }
        }
        return { isValid: true }
    },

    // 가격(price) 필드 검증 함수
    price: (price) => {
        if (isEmpty(price) || price === null || price === undefined) {
            return {
                isValid: false,
                message: messages.required.price,
                field: 'price'
            }
        }
        if (!patterns.price.test(String(price))) {
            return {
                isValid: false,
                message: messages.format.price,
                field: 'price'
            }
        }
        if (Number(price) < 0) {
            return {
                isValid: false,
                message: '가격은 0 이상이어야 합니다.',
                field: 'price'
            }
        }
        return { isValid: true }
    },

    // 출판일(publishDate) 필드 검증 함수
    publishDate: (publishDate) => {
        if (isEmpty(publishDate)) {
            return {
                isValid: false,
                message: messages.required.publishDate,
                field: 'publishDate'
            }
        }
        // yyyy-mm-dd 형식의 날짜 유효성 검사
        if (!patterns.publishDate.test(publishDate)) {
            return {
                isValid: false,
                message: messages.format.publishDate,
                field: 'publishDate'
            }
        }
        // 실제로 존재하는 날짜인지 확인
        const date = new Date(publishDate);
        if (isNaN(date.getTime())) {
            return {
                isValid: false,
                message: '유효하지 않은 날짜입니다.',
                field: 'publishDate'
            };
        }
        return { isValid: true };
    },

    // 설명(description) 필드 검증 함수
    description: (description) => {
        if (isEmpty(description)) {
            return {
                isValid: false,
                message: messages.required.description,
                field: 'description'
            }
        }
        return { isValid: true }
    },

    // 언어(language) 필드 검증 함수
    language: (language) => {
        if (isEmpty(language)) {
            return {
                isValid: false,
                message: messages.required.language,
                field: 'language'
            }
        }
        return { isValid: true }
    },

    // 페이지 수(pageCount) 필드 검증 함수
    pageCount: (pageCount) => {
        if (isEmpty(pageCount) || pageCount === null || pageCount === undefined) {
            return {
                isValid: false,
                message: messages.required.pageCount,
                field: 'pageCount'
            }
        }
        if (isNaN(pageCount) || pageCount < 0) {
            return {
                isValid: false,
                message: '페이지 수는 0 이상의 숫자로 입력해주세요.',
                field: 'pageCount'
            }
        }
        return { isValid: true }
    }
}

// 메인 검증 함수 - Book 객체 전체를 검증
export const validateBook = (book) => {
    if (!book) {
        return { isValid: false, message: '책 데이터가 필요합니다.' }
    }

    // 1. Book 클래스 필수 필드 검증
    const { title, author, isbn, price, publishDate, bookDetail } = book;

    const titleResult = validators.title(title);
    if (!titleResult.isValid) return titleResult;

    const authorResult = validators.author(author);
    if (!authorResult.isValid) return authorResult;

    const isbnResult = validators.isbn(isbn);
    if (!isbnResult.isValid) return isbnResult;

    const priceResult = validators.price(price);
    if (!priceResult.isValid) return priceResult;

    const publishDateResult = validators.publishDate(publishDate);
    if (!publishDateResult.isValid) return publishDateResult;

    // 2. BookDetail 클래스 필드 검증 (detail이 존재하는 경우에만)
    if (bookDetail) {
        const { description, language, pageCount } = bookDetail;

        const descriptionResult = validators.description(description);
        if (!descriptionResult.isValid) return descriptionResult;

        const languageResult = validators.language(language);
        if (!languageResult.isValid) return languageResult;

        const pageCountResult = validators.pageCount(pageCount);
        if (!pageCountResult.isValid) return pageCountResult;
    }

    // 모든 검증 통과
    return { isValid: true }
}

// 실시간 검증 함수 - 사용자가 입력하는 중에 개별 필드를 검증할 때 사용
export const validateField = (fieldName, value) => {
    const validator = validators[fieldName]

    if (!validator) {
        return {
            isValid: true,
            message: '알 수 없는 필드입니다.'
        }
    }

    return validator(value)
}

/*
사용 예시:

// 전체 책 데이터 검증
const bookData = {
    title: '자바스크립트 완벽 가이드',
    author: '길동 홍',
    isbn: '978-89-6077-733-1',
    price: 35000,
    publishDate: '2023-01-15',
    bookDetail: {
        description: '자바스크립트의 모든 것을 다룹니다.',
        language: '한국어',
        pageCount: 750
    }
};

const result = validateBook(bookData);
if (!result.isValid) {
    console.log(`검증 실패: ${result.message}`);
    console.log(`문제 필드: ${result.field}`);
} else {
    console.log('모든 필드가 유효합니다.');
}

// 개별 필드 검증 (실시간 검증용)
const priceResult = validateField('price', -100);
if (!priceResult.isValid) {
    console.log(`가격 오류: ${priceResult.message}`);
}
*/