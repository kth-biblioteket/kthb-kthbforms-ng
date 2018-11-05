export const person = {
    name: {
      label: 'Name',
      value: '',
      type: 'text',
      validation: {
        required: true
      }
    },
    age: {
      label: 'Age',
      value: '',
      type: 'text'
    },
    gender: {
      label: 'Gender',
      value: 'M',
      type: 'radio',
      options: [
        { label: "Male", value: 'M'},
        { label: "Female", value: 'F'}
      ]
    }, 
    city: {
      label: 'City',
      value: '',
      type: 'select',
      options: [
        { label: "(choose one)", value: ''},
        { label: "Bolzano", value: '39100'},
        { label: "Meltina", value: '39010'},
        { label: "Appiano", value: '39057'}
      ],
      validation: {
        required: true
      }
    }
  }