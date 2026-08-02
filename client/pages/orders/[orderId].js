import { useState, useEffect } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import Router from 'next/router';

import { useRequest } from '../../hooks/use-request';

export default function ShowOrder({ order, currentUser }) {
  const [timeLeft, setTimeLeft] = useState(0);
  const { doRequest, errors } = useRequest({
    method: 'post',
    url: `/api/payments`,
    body: {
      orderId: order.id,
    },
    onSuccess: () => Router.push('/orders'),
  });

  useEffect(() => {
    const calcTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };

    calcTimeLeft();
    const timerId = setInterval(calcTimeLeft, 1000);

    return () => clearInterval(timerId);
  }, [order]);

  return (
    <div className='container mx-auto'>
      <h2>{timeLeft < 0 ? 'Order Expired' : `Time left to pay: ${timeLeft} seconds`}</h2>

      {timeLeft >= 0 && (
        <StripeCheckout
          stripeKey='pk_test_51SVzKrDkAnDmtpm3un4Iu1XziMrtFQU8A5hbypow5Nw521bGssE9gHrMS8HG8UtsiMSWrcAwqFo8iRPw58gynAxV008Qex7gfs'
          token={({ id }) => doRequest({ token: id })}
          amount={order.ticket.price * 100}
          email={currentUser.email}
        />
      )}
    </div>
  );
}

ShowOrder.getInitialProps = async (context, client) => {
  const { orderId } = context.query;

  const { data: order } = await client.get(`/api/orders/${orderId}`);

  return { order };
};
