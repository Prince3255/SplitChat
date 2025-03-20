export const dateFormater = (date) => {
    if (!date) {
      console.error('Invalid date provided:', date);
      return 'Invalid Date';
    }

    const createdAt = new Date(date);

    if (isNaN(createdAt.getTime())) {
      console.error('Unable to parse date:', date);
      return 'Invalid Date';
    }
  
    const formattedDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(createdAt);
    
    return formattedDate
  }