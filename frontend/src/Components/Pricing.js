import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';

const PricingSection = () => {
  const plans = [
    {
      name: 'Free',
      price: 'P0/month',
      feature: 'Individual Character Recognition',
      highlighted: true,
      buttonLabel: 'Current Plan',
      disabled: true,
    },
    {
      name: 'Premium',
      price: 'P289/month',
      feature: 'Complete Word Recognition',
      highlighted: false,
      buttonLabel: 'Get Premium',
      disabled: false,
    },
  ];

  return (
    <section className="w-full bg-stone-50 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <h2 className="mb-10 text-center text-3xl font-bold text-orange-900 sm:text-4xl">Pricing</h2>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`flex min-h-[380px] flex-col overflow-hidden rounded-2xl border bg-white shadow-md transition hover:-translate-y-1 hover:shadow-lg ${
                plan.highlighted ? 'border-orange-900 shadow-lg' : 'border-stone-200'
              }`}
            >
              <div className="bg-orange-900 p-6 text-white">
                <h3 className="text-2xl font-semibold">{plan.name}</h3>
                <p className="mt-1 text-lg text-orange-100">{plan.price}</p>
              </div>

              <ul className="flex-1 space-y-4 p-6 text-stone-800">
                <li className="flex items-start gap-3 text-base sm:text-lg">
                  <FaCheckCircle className="mt-0.5 shrink-0 text-orange-900" />
                  <span>{plan.feature}</span>
                </li>
              </ul>

              <div className="p-6 pt-0">
                <button
                  disabled={plan.disabled}
                  className="w-full rounded-lg bg-orange-900 px-4 py-3 font-semibold text-white transition hover:bg-orange-800 disabled:cursor-not-allowed disabled:bg-stone-300"
                >
                  {plan.buttonLabel}
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
