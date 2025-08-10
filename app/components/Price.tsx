import clsx from 'clsx';

const DEFAULT_CURRENCY = 'PKR'; // Changed from USD to PKR as default

const formatPrice = (amount: string, currencyCode: string = 'PKR') => {
  // Normalize currency code
  const normalizedCurrency = currencyCode === 'Rs.' ? 'PKR' : (currencyCode || 'PKR');
  try {
    // Ensure amount is a valid number
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) return 'Invalid amount';

    // Create a fallback formatter in case the currency is invalid
    // For PKR, we want to show the Rs. symbol instead of PKR
    const isPKR = normalizedCurrency === 'PKR';
    const formatter = new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: normalizedCurrency,
      currencyDisplay: isPKR ? 'code' : 'symbol',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0, // No decimal places for PKR
    });

    // Format the amount
    let formatted = formatter.format(numericAmount);
    
    // For PKR, replace the code with Rs. symbol
    if (isPKR) {
      formatted = formatted.replace('PKR', 'Rs.');
    }
    
    return formatted;
  } catch (error) {
    console.error('Error formatting price:', error);
    return amount; // Return the raw amount if formatting fails
  }
};

const Price = ({
  amount,
  className,
  currencyCode = 'PKR', // Default to PKR since we're using Rs.
  currencyCodeClassName,
  ...props
}: {
  amount: string | number;
  className?: string;
  currencyCode?: string;
  currencyCodeClassName?: string;
} & React.ComponentProps<'p'>) => {
  // Convert amount to string if it's a number
  const amountStr = typeof amount === 'number' ? amount.toString() : amount;
  
  return (
    <p suppressHydrationWarning={true} className={className} {...props}>
      {formatPrice(amountStr, currencyCode)}
      {currencyCode && (
        <span className={clsx('ml-1 inline', currencyCodeClassName)}>
          {currencyCode}
        </span>
      )}
    </p>
  );
};

export default Price;
