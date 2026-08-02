import axios from 'axios';
import { useState } from 'react';

export const useRequest = ({ method, url, body, onSuccess }) => {
  const [errors, setErrors] = useState('');

  const doRequest = async (props = {}) => {
    try {
      setErrors('');

      const { data } = await axios[method](url, { ...body, ...props });

      if (onSuccess) onSuccess(data);

      return data;
    } catch (err) {
      setErrors(<p className='text-red-400 bg-amber-50 p-2 rounded'>{err.response?.data.message || err.message}</p>);
    }
  };

  return { errors, doRequest };
};
