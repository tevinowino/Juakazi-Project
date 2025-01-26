import { useState} from "react";
import { Form, useNavigate  } from "react-router";
import type { ChangeEvent } from 'react';

// Define types
interface JobFormData {
  title: string;
  description: string;
  category: string;
  customCategory?: string;
  location: string;
  budget: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  category?: string;
  customCategory?: string;
  location?: string;
  budget?: string;
}

export default function AddJob() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    description: "",
    category: "",
    customCategory: "",
    location: "",
    budget: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // List of categories
  const categories: string[] = [
    "Plumbing",
    "Electrical",
    "Cleaning",
    "Painting",
    "Carpentry",
    "Gardening",
    "Masonry",
    "Tiling",
    "Roofing",
    "Automotive Repair",
    "Pest Control",
    "Appliance Repair",
    "General Maintenance",
    "Other", // Triggers custom input
  ];

  // Handle input change
  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // Handle form submission

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Add New Job</h2>
      <Form method="post" action="/api/jobs" className="space-y-4">
        {/* Job Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Job Title
          </label>
          <input
            type="text"
            name="title"
            placeholder="Enter job title"
            value={formData.title}
            onChange={handleChange}
            className="mt-1 p-2 w-full border rounded-md"
          />
          {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            placeholder="Enter job description"
            value={formData.description}
            onChange={handleChange}
            className="mt-1 p-2 w-full border rounded-md"
          ></textarea>
          {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            title="Select Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="mt-1 p-2 w-full border rounded-md"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
        </div>

        {/* Custom Category (Only shown when "Other" is selected) */}
        {formData.category === "Other" && (
          <div>
            <label htmlFor="customCategory" className="block text-sm font-medium text-gray-700">
              Specify Category
            </label>
            <input
              type="text"
              placeholder="Enter custom category"
              name="customCategory"
              value={formData.customCategory}
              onChange={handleChange}
              className="mt-1 p-2 w-full border rounded-md"
            />
            {errors.customCategory && <p className="text-red-500 text-sm">{errors.customCategory}</p>}
          </div>
        )}

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Location
          </label>
          <input
            type="text"
            placeholder="Enter location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="mt-1 p-2 w-full border rounded-md"
          />
          {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
        </div>

        {/* Budget */}
        <div>
          <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
            Budget (KSh)
          </label>
          <input
            type="text"
            placeholder="Enter budget"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            className="mt-1 p-2 w-full border rounded-md"
          />
          {errors.budget && <p className="text-red-500 text-sm">{errors.budget}</p>}
        </div>
        <input type="hidden" value={'AddJob'} name="actionType" />

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
        >
          Post Job
        </button>
      </Form>
    </div>
  );
}
