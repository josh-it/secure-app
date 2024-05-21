const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
require('dotenv').config();

app.use(express.json());

app.post('/create-resource', (req, res) => {
  const formData = req.body;
  formData.trackerrms.createResource.credentials.username = process.env.USERNAME;
  formData.trackerrms.createResource.credentials.password = process.env.PASSWORD;

  // Make the first API call to create the resource
  fetch('https://evoapius.tracker-rms.com/api/widget/createResource', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log('Resource created successfully:', data);
      const recordId = data.recordId;
      const currentDate = new Date();
      const formattedDate = currentDate.toISOString().split('T')[0];
      const formattedTime = currentDate.toTimeString().split(' ')[0];

      const activityData = {
        trackerrms: {
          createActivity: {
            activity: {
              subject: 'New Activity',
              type: 'Email',
              date: formattedDate,
              time: formattedTime,
              status: 'Completed',
              priority: 'Medium',
              contactType: 'Outbound',
              note: 'Associated with new resource creation',
              linkRecordType: 'R',
              linkRecordId: recordId,
            },
          },
        },
      };

      fetch('https://evoapius.tracker-rms.com/api/widget/createActivity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Basic ' + Buffer.from(`${process.env.USERNAME}:${process.env.PASSWORD}`).toString('base64'),
        },
        body: JSON.stringify(activityData),
      })
        .then((activityResponse) => activityResponse.json())
        .then((activityData) => {
          console.log('Activity created successfully:', activityData);
          res.json(activityData);
        })
        .catch((error) => {
          console.error('Failed to create activity:', error);
          res.status(500).json({ error: 'Error creating activity' });
        });
    })
    .catch((error) => {
      console.error('Failed to create resource:', error);
      res.status(500).json({ error: 'Error creating resource' });
    });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
