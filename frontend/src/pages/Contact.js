import React from 'react';

const Contact = () => {
  return (
    <div className="contact fade-in">
      <div className="container">
        <h1>Contact Us</h1>
        <p>Get in touch with us</p>
        
        <div className="contact-content">
          <div className="contact-info">
            <h2>Contact Information</h2>
            <p>Address: Istanbul, Turkey</p>
            <p>Phone: +90 555 123 4567</p>
            <p>Email: info@pebdeq.com</p>
          </div>
          
          <div className="contact-form">
            <h2>Send us a message</h2>
            <form>
              <div className="form-group">
                <label>Name:</label>
                <input type="text" placeholder="Your name" />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input type="email" placeholder="Your email" />
              </div>
              <div className="form-group">
                <label>Subject:</label>
                <input type="text" placeholder="Message subject" />
              </div>
              <div className="form-group">
                <label>Message:</label>
                <textarea placeholder="Your message" rows="5"></textarea>
              </div>
              <button type="submit" className="btn btn-primary">Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 