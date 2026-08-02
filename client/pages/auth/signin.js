import { useState } from 'react';
import axios from 'axios';
import Router from 'next/router';

import { useRequest } from '../../hooks/use-request';

export default function Signin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { errors, doRequest } = useRequest({ method: 'post', url: '/api/auth/signin', body: { email, password }, onSuccess: () => Router.push('/') });

  async function submitHandler(e) {
    e.preventDefault();

    await doRequest();
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-100 px-4'>
      <div className='w-full max-w-sm rounded-xl bg-white p-6 shadow-lg'>
        <h1 className='mb-6 text-center text-2xl font-bold'>Sign In</h1>

        <form className='space-y-4' onSubmit={submitHandler}>
          <div>
            <label className='mb-1 block text-sm font-medium text-gray-700'>Email</label>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              className='w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
            />
          </div>

          <div>
            <label className='mb-1 block text-sm font-medium text-gray-700'>Password</label>
            <input
              value={password}
              onChange={e => setPassword(e.target.value)}
              type='password'
              className='w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
            />
          </div>

          {errors && errors}

          <button type='submit' className='cursor-pointer w-full rounded-lg bg-blue-600 py-2 font-medium text-white transition hover:bg-blue-700'>
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
