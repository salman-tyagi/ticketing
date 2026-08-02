import Router from 'next/router';

import { useRequest } from '../../hooks/use-request.js';

export default function Ticket({ ticket }) {
  const { doRequest, errors } = useRequest({
    method: 'post',
    url: '/api/orders',
    body: {
      ticket: ticket.id,
    },
    onSuccess: order => Router.push('/orders/[orderId]', `/orders/${order.id}`),
  });

  return (
    <div className='container mx-auto'>
      <h1>{ticket.title}</h1>
      <p>{ticket.price}</p>

      {errors}

      <button onClick={() => doRequest()} className='border bg-sky-400 hover:bg-sky-500 text-white rounded-md px-2 cursor-pointer active:bg-sky-400'>
        Purchase
      </button>
    </div>
  );
}

Ticket.getInitialProps = async (context, client) => {
  const { ticketId } = context.query;

  const { data: ticket } = await client.get(`/api/tickets/${ticketId}`);

  return { ticket };
};
