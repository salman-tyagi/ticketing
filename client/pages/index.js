import Link from 'next/link';

function LandingPage({ currentUser, tickets }) {
  return (
    <table className='mx-auto border-collapse container'>
      <thead>
        <tr className='bg-sky-500'>
          <th className='px-4 py-2 text-left text-sm font-semibold text-white'>Title</th>
          <th className='px-4 py-2 text-left text-sm font-semibold text-white'>Price</th>
          <th className='px-4 py-2 text-left text-sm font-semibold text-white'>Link</th>
        </tr>
      </thead>

      <tbody className='divide-y divide-sky-100'>
        {tickets?.map(ticket => (
          <tr key={ticket.id} className='hover:bg-sky-50'>
            <td className='px-4 py-2 text-sm text-gray-800'>{ticket.title}</td>
            <td className='px-4 py-2 text-sm text-gray-800'>{ticket.price}</td>
            <td className='px-4 py-2 text-sm text-gray-800'>
              <Link href='/tickets/[ticketId]' as={`/tickets/${ticket.id}`}>
                View
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return <h1 className='text-2xl'>{currentUser ? `Welcome, ${currentUser.email}` : 'You are not logged in!'}</h1>;
}

LandingPage.getInitialProps = async (context, client, currentUser) => {
  const { data: tickets } = await client.get('/api/tickets');

  return { tickets };
};

export default LandingPage;
