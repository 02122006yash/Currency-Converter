// Currency Converter Application
class CurrencyConverter {
    constructor() {
        this.apiEndpoint = 'https://api.exchangerate-api.com/v4/latest/';
        this.exchangeRates = {};
        this.lastUpdated = null;
        
        this.supportedCurrencies = [
            {"code": "USD", "name": "US Dollar", "symbol": "$"},
            {"code": "EUR", "name": "Euro", "symbol": "€"},
            {"code": "GBP", "name": "British Pound", "symbol": "£"},
            {"code": "JPY", "name": "Japanese Yen", "symbol": "¥"},
            {"code": "AUD", "name": "Australian Dollar", "symbol": "A$"},
            {"code": "CAD", "name": "Canadian Dollar", "symbol": "C$"},
            {"code": "CHF", "name": "Swiss Franc", "symbol": "Fr"},
            {"code": "CNY", "name": "Chinese Yuan", "symbol": "¥"},
            {"code": "INR", "name": "Indian Rupee", "symbol": "₹"},
            {"code": "KRW", "name": "South Korean Won", "symbol": "₩"},
            {"code": "BRL", "name": "Brazilian Real", "symbol": "R$"},
            {"code": "RUB", "name": "Russian Ruble", "symbol": "₽"},
            {"code": "MXN", "name": "Mexican Peso", "symbol": "$"},
            {"code": "SGD", "name": "Singapore Dollar", "symbol": "S$"},
            {"code": "HKD", "name": "Hong Kong Dollar", "symbol": "HK$"},
            {"code": "NOK", "name": "Norwegian Krone", "symbol": "kr"},
            {"code": "SEK", "name": "Swedish Krona", "symbol": "kr"},
            {"code": "DKK", "name": "Danish Krone", "symbol": "kr"},
            {"code": "PLN", "name": "Polish Zloty", "symbol": "zł"},
            {"code": "TRY", "name": "Turkish Lira", "symbol": "₺"},
            {"code": "ZAR", "name": "South African Rand", "symbol": "R"},
            {"code": "AED", "name": "UAE Dirham", "symbol": "د.إ"},
            {"code": "SAR", "name": "Saudi Riyal", "symbol": "﷼"},
            {"code": "THB", "name": "Thai Baht", "symbol": "฿"},
            {"code": "NZD", "name": "New Zealand Dollar", "symbol": "NZ$"}
        ];

        // Wait for DOM to be fully loaded before initializing
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        this.initializeElements();
        this.populateCurrencyDropdowns();
        this.setDefaultValues();
        this.setupEventListeners();
        this.updateTimestamp();
    }

    initializeElements() {
        // Form elements
        this.form = document.getElementById('converterForm');
        this.amountInput = document.getElementById('amount');
        this.fromCurrencySelect = document.getElementById('fromCurrency');
        this.toCurrencySelect = document.getElementById('toCurrency');
        this.swapBtn = document.getElementById('swapBtn');
        this.convertBtn = document.getElementById('convertBtn');

        // Result elements
        this.resultSection = document.getElementById('resultSection');
        this.resultDisplay = document.getElementById('resultDisplay');
        this.errorDisplay = document.getElementById('errorDisplay');
        this.loadingDisplay = document.getElementById('loadingDisplay');
        this.convertedAmount = document.getElementById('convertedAmount');
        this.resultCurrency = document.getElementById('resultCurrency');
        this.exchangeRate = document.getElementById('exchangeRate');
        this.errorText = document.getElementById('errorText');
        this.updateTime = document.getElementById('updateTime');

        // Button loading elements
        this.btnText = this.convertBtn.querySelector('.btn-text');
        this.btnLoader = this.convertBtn.querySelector('.btn-loader');
    }

    setupEventListeners() {
        // Form submission
        if (this.form) {
            this.form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.convertCurrency();
            });
        }

        // Convert button click
        if (this.convertBtn) {
            this.convertBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.convertCurrency();
            });
        }

        // Swap button
        if (this.swapBtn) {
            this.swapBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.swapCurrencies();
            });
        }

        // Amount input validation and events
        if (this.amountInput) {
            this.amountInput.addEventListener('input', (e) => {
                this.validateAmountInput(e.target);
            });

            this.amountInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.convertCurrency();
                }
            });
        }

        // Currency change listeners
        if (this.fromCurrencySelect) {
            this.fromCurrencySelect.addEventListener('change', () => {
                this.clearResult();
            });
        }

        if (this.toCurrencySelect) {
            this.toCurrencySelect.addEventListener('change', () => {
                this.clearResult();
            });
        }
    }

    populateCurrencyDropdowns() {
        if (!this.fromCurrencySelect || !this.toCurrencySelect) {
            console.error('Currency dropdown elements not found');
            return;
        }

        // Clear existing options
        this.fromCurrencySelect.innerHTML = '';
        this.toCurrencySelect.innerHTML = '';

        // Populate both dropdowns
        this.supportedCurrencies.forEach(currency => {
            const optionFrom = document.createElement('option');
            optionFrom.value = currency.code;
            optionFrom.textContent = `${currency.code} - ${currency.name}`;
            this.fromCurrencySelect.appendChild(optionFrom);

            const optionTo = document.createElement('option');
            optionTo.value = currency.code;
            optionTo.textContent = `${currency.code} - ${currency.name}`;
            this.toCurrencySelect.appendChild(optionTo);
        });
    }

    setDefaultValues() {
        if (this.amountInput) {
            this.amountInput.value = '100';
        }
        if (this.fromCurrencySelect) {
            this.fromCurrencySelect.value = 'USD';
        }
        if (this.toCurrencySelect) {
            this.toCurrencySelect.value = 'EUR';
        }
    }

    validateAmountInput(input) {
        const value = parseFloat(input.value);
        if (input.value && (isNaN(value) || value < 0)) {
            input.setCustomValidity('Please enter a valid positive number');
            return false;
        } else {
            input.setCustomValidity('');
            return true;
        }
    }

    async convertCurrency() {
        console.log('Convert currency called');
        
        const amount = parseFloat(this.amountInput.value);
        const fromCurrency = this.fromCurrencySelect.value;
        const toCurrency = this.toCurrencySelect.value;

        console.log('Conversion params:', { amount, fromCurrency, toCurrency });

        // Validation
        if (!amount || amount <= 0) {
            this.showError('Please enter a valid amount greater than 0');
            return;
        }

        if (fromCurrency === toCurrency) {
            this.showResult(amount, toCurrency, 1);
            return;
        }

        try {
            this.showLoading();
            const rate = await this.getExchangeRate(fromCurrency, toCurrency);
            const convertedAmount = amount * rate;
            this.showResult(convertedAmount, toCurrency, rate, fromCurrency);
        } catch (error) {
            console.error('Conversion error:', error);
            this.showError('Failed to fetch exchange rates. Please check your connection and try again.');
        }
    }

    async getExchangeRate(fromCurrency, toCurrency) {
        try {
            console.log(`Fetching rate from ${fromCurrency} to ${toCurrency}`);
            
            // Always fetch fresh data for now to ensure it works
            const response = await fetch(`${this.apiEndpoint}${fromCurrency}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('API Response:', data);
            
            if (!data.rates || !data.rates[toCurrency]) {
                throw new Error(`Exchange rate not available for ${toCurrency}`);
            }

            // Cache the rates
            this.exchangeRates[fromCurrency] = data.rates;
            this.lastUpdated = data.date || new Date().toISOString();
            this.updateTimestamp();

            return data.rates[toCurrency];
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    swapCurrencies() {
        console.log('Swap currencies called');
        
        if (!this.fromCurrencySelect || !this.toCurrencySelect) {
            console.error('Currency selects not found');
            return;
        }

        const fromValue = this.fromCurrencySelect.value;
        const toValue = this.toCurrencySelect.value;
        
        this.fromCurrencySelect.value = toValue;
        this.toCurrencySelect.value = fromValue;
        
        // Add visual feedback
        this.swapBtn.style.transform = 'rotate(180deg) scale(0.95)';
        setTimeout(() => {
            this.swapBtn.style.transform = '';
        }, 200);

        this.clearResult();
    }

    showLoading() {
        this.hideAllResults();
        if (this.loadingDisplay) {
            this.loadingDisplay.classList.remove('hidden');
        }
        
        // Button loading state
        if (this.convertBtn) {
            this.convertBtn.classList.add('loading');
            this.convertBtn.disabled = true;
        }
    }

    showResult(amount, currency, rate, fromCurrency = null) {
        this.hideAllResults();
        
        if (this.convertedAmount && this.resultCurrency) {
            // Format the converted amount
            const formattedAmount = this.formatCurrency(amount, currency);
            this.convertedAmount.textContent = formattedAmount;
            this.resultCurrency.textContent = currency;
        }

        // Show exchange rate
        if (this.exchangeRate) {
            if (fromCurrency && rate !== 1) {
                const formattedRate = this.formatNumber(rate, 6);
                this.exchangeRate.textContent = `1 ${fromCurrency} = ${formattedRate} ${currency}`;
            } else if (rate === 1) {
                this.exchangeRate.textContent = `Same currency - no conversion needed`;
            }
        }

        if (this.resultDisplay) {
            this.resultDisplay.classList.remove('hidden');
        }
        this.resetButtonState();
    }

    showError(message) {
        this.hideAllResults();
        if (this.errorText) {
            this.errorText.textContent = message;
        }
        if (this.errorDisplay) {
            this.errorDisplay.classList.remove('hidden');
        }
        this.resetButtonState();
    }

    hideAllResults() {
        if (this.resultDisplay) {
            this.resultDisplay.classList.add('hidden');
        }
        if (this.errorDisplay) {
            this.errorDisplay.classList.add('hidden');
        }
        if (this.loadingDisplay) {
            this.loadingDisplay.classList.add('hidden');
        }
    }

    clearResult() {
        this.hideAllResults();
    }

    resetButtonState() {
        if (this.convertBtn) {
            this.convertBtn.classList.remove('loading');
            this.convertBtn.disabled = false;
        }
    }

    formatCurrency(amount, currencyCode) {
        // Special formatting for currencies
        let decimals = 2;
        if (currencyCode === 'JPY' || currencyCode === 'KRW') {
            decimals = 0; // These currencies typically don't use decimal places
        }

        return this.formatNumber(amount, decimals);
    }

    formatNumber(number, decimals = 2) {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(number);
    }

    updateTimestamp() {
        if (this.updateTime) {
            if (this.lastUpdated) {
                const date = new Date(this.lastUpdated);
                this.updateTime.textContent = date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } else {
                this.updateTime.textContent = 'Not available';
            }
        }
    }
}

// Initialize the application
let converter;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        converter = new CurrencyConverter();
    });
} else {
    converter = new CurrencyConverter();
}