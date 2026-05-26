/* eslint-disable no-unused-vars */
// client/src/pages/student/CartPage.jsx
import React, { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const CartPage = () => {
  const { cart, removeFromCart, currency, backendUrl, getToken } =
    useContext(AppContext);

  const calculateDiscountedPrice = (course) => {
    const price = Number(course.coursePrice || 0);
    const discount = Number(course.discount || 0);
    return price - (discount * price) / 100;
  };

  const total = cart.reduce(
    (sum, c) => sum + calculateDiscountedPrice(c),
    0
  );

  const handleCheckout = async () => {
    try {
      if (!cart.length) {
        toast.error("Cart is empty");
        return;
      }

      const token = await getToken();

      const res = await axios.post(
        `${backendUrl}/api/user/purchase`,
        { cart },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.data.success) {
        toast.error(res.data.message);
        return;
      }

      window.location.href = res.data.session_url;

    } catch (err) {
      console.error(err);
      toast.error("Checkout failed ❌");
    }
  };

  return (
    <div className="px-6 md:px-20 py-10">
      <h1 className="text-3xl font-semibold mb-6">My Cart</h1>

      {cart.length === 0 ? (
        <p className="text-gray-500 text-lg">Your cart is empty.</p>
      ) : (
        <>
          <div className="grid gap-4">
            {cart.map((course) => (
              <div
                key={course._id}
                className="flex items-center justify-between border rounded-xl p-4 shadow-sm bg-white"
              >
                <div className="flex items-center gap-4">
                  {/* ✅ FINAL FIX */}
                  <img
                    src={course.effectiveThumbnail}
                    alt={course.courseTitle}
                    className="w-24 h-16 object-cover rounded-md bg-gray-100"
                  />

                  <div>
                    <p className="font-semibold text-gray-800">
                      {course.courseTitle}
                    </p>

                    <p className="text-sm text-gray-500">
                      Educator: {course.educator?.name || "Unknown"}
                    </p>

                    <p className="text-sm text-gray-700 mt-1">
                      {currency}
                      {calculateDiscountedPrice(course).toFixed(2)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => removeFromCart(course._id)}
                  className="text-red-500 font-medium text-lg px-2"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="mt-10 border rounded-xl p-6 bg-white shadow-sm max-w-lg">
            <p className="text-xl font-semibold">Order Summary</p>

            <p className="text-gray-600 mt-2">
              Total:{" "}
              <span className="font-bold text-gray-800">
                {currency}
                {total.toFixed(2)}
              </span>
            </p>

            <button
              onClick={handleCheckout}
              className="mt-5 bg-blue-600 text-white w-full py-3 rounded-xl text-lg font-medium"
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;