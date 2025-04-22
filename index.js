const form = document.getElementById('coffee-form');
const addBeverageButton = form.querySelector('.add-button');
const submitButton = form.querySelector('.submit-button');
const beveragesContainer = document.getElementById('beverages-container');
const firstBeverageFieldset = form.querySelector('.beverage');
const modalOverlay = document.querySelector('.modal-overlay');
const modal = document.querySelector('.modal');
const modalCloseButton = modal.querySelector('.modal-close-button');
const modalContent = modal.querySelector('.modal-content');

let beverageCounter = 1;

function updateBeverageNumbers() {
    const allBeverages = form.querySelectorAll('.beverage');
    beverageCounter = allBeverages.length;
    allBeverages.forEach((fieldset, index) => {
        const countElement = fieldset.querySelector('.beverage-count');
        const radioButtons = fieldset.querySelectorAll('input[type="radio"]');
        const currentBeverageNumber = index + 1;

        if (countElement) {
            countElement.textContent = `Напиток №${currentBeverageNumber}`;
        }
        radioButtons.forEach(radio => {
            radio.name = `milk-${currentBeverageNumber}`;
        });
    });
}

function updateRemoveButtonsState() {
    const allRemoveButtons = form.querySelectorAll('.remove-beverage');
    const beveragesCount = form.querySelectorAll('.beverage').length;

    allRemoveButtons.forEach(button => {
        button.disabled = beveragesCount <= 1;
    });
}

function getPluralizedWord(number) {
    const lastDigit = number % 10;
    const lastTwoDigits = number % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
        return 'напитков';
    }
    if (lastDigit === 1) {
        return 'напиток';
    }
    if (lastDigit >= 2 && lastDigit <= 4) {
        return 'напитка';
    }
    return 'напитков';
}

function showModal() {
    modalOverlay.classList.remove('hidden');
    modal.classList.remove('hidden');
}

function hideModal() {
    modalOverlay.classList.add('hidden');
    modal.classList.add('hidden');
    modalContent.innerHTML = '';
}

function handleAddBeverage() {
    const newBeverage = firstBeverageFieldset.cloneNode(true);
    beverageCounter++;

    const select = newBeverage.querySelector('select');
    if (select) {
        select.selectedIndex = 0;
    }
    const radios = newBeverage.querySelectorAll('input[type="radio"]');
    radios.forEach(radio => radio.checked = false);
    const firstRadio = newBeverage.querySelector('input[type="radio"]');
    if (firstRadio) {
         firstRadio.checked = true;
    }

    const checkboxes = newBeverage.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => checkbox.checked = false);

    if (beveragesContainer.children.length === 0) {
         firstBeverageFieldset.after(newBeverage);
    } else {
         beveragesContainer.lastElementChild.after(newBeverage);
    }

    updateBeverageNumbers();
    updateRemoveButtonsState();
}

function handleRemoveBeverage(event) {
    if (event.target.classList.contains('remove-beverage')) {
        const fieldsetToRemove = event.target.closest('.beverage');
        if (fieldsetToRemove && form.querySelectorAll('.beverage').length > 1) {
            fieldsetToRemove.remove();
            updateBeverageNumbers();
            updateRemoveButtonsState();
        }
    }
}

function handleSubmit(event) {
    event.preventDefault();

    const allBeverages = form.querySelectorAll('.beverage');
    const numBeverages = allBeverages.length;
    const pluralizedWord = getPluralizedWord(numBeverages);

    let modalHTML = `<h1>Заказ принят!!!!</h1><h5>Вы заказали ${numBeverages} ${pluralizedWord}</h5>`;

    modalHTML += `<table class="order-table">
                    <thead>
                        <tr>
                            <th>Напиток</th>
                            <th>Молоко</th>
                            <th>Дополнительно</th>
                        </tr>
                    </thead>
                    <tbody>`;

    allBeverages.forEach(fieldset => {
        const beverageSelect = fieldset.querySelector('[data-beverage-select]');
        const beverageName = beverageSelect.options[beverageSelect.selectedIndex].text;

        const selectedMilkInput = fieldset.querySelector('input[type="radio"]:checked');
        const milkName = selectedMilkInput ? selectedMilkInput.dataset.milkOption || selectedMilkInput.nextElementSibling.textContent : 'не выбрано';

        const selectedOptionsInputs = fieldset.querySelectorAll('input[type="checkbox"]:checked');
        const optionsList = [];
        selectedOptionsInputs.forEach(input => {
            optionsList.push(input.dataset.extraOption || input.nextElementSibling.textContent);
        });
        const optionsString = optionsList.length > 0 ? optionsList.join(', ') : 'нет';

        modalHTML += `<tr>
                        <td>${beverageName}</td>
                        <td>${milkName}</td>
                        <td>${optionsString}</td>
                      </tr>`;
    });

    modalHTML += `  </tbody>
                  </table>`;

    modalContent.innerHTML = modalHTML;
    showModal();
}

addBeverageButton.addEventListener('click', handleAddBeverage);
form.addEventListener('click', handleRemoveBeverage);
form.addEventListener('submit', handleSubmit);
modalCloseButton.addEventListener('click', hideModal);
modalOverlay.addEventListener('click', hideModal);

updateBeverageNumbers();
updateRemoveButtonsState();
