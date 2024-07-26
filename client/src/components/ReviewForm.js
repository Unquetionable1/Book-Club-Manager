import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const ReviewForm = ({ bookId, onReviewPosted }) => {
  const initialValues = {
    rating: '',
    comment: '',
  };

  const validationSchema = Yup.object({
    rating: Yup.number()
      .min(1, 'Rating must be at least 1')
      .max(5, 'Rating must be at most 5')
      .required('Rating is required'),
    comment: Yup.string(),
  });

  const onSubmit = async (values, { setSubmitting, resetForm }) => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      console.error('User is not authenticated');
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch('https://your-api-endpoint/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          book_id: bookId,
          rating: values.rating,
          comment: values.comment,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('Review posted successfully:', data);
      onReviewPosted();
      resetForm();
    } catch (error) {
      console.error('Error posting review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2>Post a Review</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            <div>
              <label htmlFor="rating">Rating</label>
              <Field as="select" name="rating">
                <option value="">Select Rating</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </Field>
              <ErrorMessage name="rating" component="div" />
            </div>
            <div>
              <label htmlFor="comment">Comment</label>
              <Field as="textarea" id="comment" name="comment" />
              <ErrorMessage name="comment" component="div" />
            </div>
            <button type="submit" disabled={isSubmitting}>
              Submit
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ReviewForm;
