export default function OrderIndex({ orders }) {
  return (
    <ul className='container mx-auto pt-10'>
      {orders.map((order, i) => (
        <li key={order.id}>
          {i + 1}. {order.ticket.title} - {order.status}
        </li>
      ))}
    </ul>
  );
}

OrderIndex.getInitialProps = async (context, client) => {
  const { data: orders } = await client.get('/api/orders');

  return { orders };
};
