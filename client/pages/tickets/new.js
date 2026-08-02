import { useState } from 'react';
import Router from 'next/router';

import { useRequest } from '../../hooks/use-request';

export default function NewTicket() {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');

  const { doRequest, errors } = useRequest({
    method: 'post',
    url: '/api/tickets',
    body: { title, price: parseInt(parseInt(price).toFixed()) },
    onSuccess: () => Router.push('/'),
  });

  const submitHandler = async e => {
    e.preventDefault();

    await doRequest();

    setTitle('');
    setPrice('');
  };

  return (
    <div>
      <form className='max-w-sm mx-auto space-y-4' onSubmit={submitHandler}>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>Title</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>Price</label>
          <input
            value={price}
            onChange={e => setPrice(e.target.value)}
            type='number'
            className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900'
          />
        </div>

        {errors}

        <button className='w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2'>
          Submit
        </button>
      </form>
    </div>
  );
}
