import Link from 'next/link';
import Router from 'next/router';

import { useRequest } from '../hooks/use-request';

export default function Nav({ currentUser }) {
  const { doRequest } = useRequest({ method: 'get', url: '/api/auth/logout', onSuccess: () => Router.push('/') });

  return (
    <nav className='flex gap-10 justify-end p-4 bg-sky-200 font-medium px-5 text-lg'>
      <Link className='mr-auto' href='/'>
        GitTix
      </Link>

      {!currentUser && (
        <>
          <Link href='/auth/signup'>Signup</Link>

          <Link href='/auth/signin'>Signin</Link>
        </>
      )}

      {currentUser && (
        <>
          <Link href='/tickets/new'>Sell Tickets</Link>

          <Link href='/orders'>My Orders</Link>

          <button className='cursor-pointer' onClick={doRequest}>
            Sign out
          </button>
        </>
      )}
    </nav>
  );
}
