import { format } from 'date-fns';

export const renderLocalTime = (utcString: string, formatString: string = 'dd/MM/yyyy HH:mm') => {
    if (!utcString) return '';
    const date = new Date(utcString+"Z");
    
    return format(date, formatString); 
};