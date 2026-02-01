import React from 'react';
import { useParams } from 'react-router-dom';
import EvaluationForm from './EvaluationForm';

const EvaluationFormView = () => {
    const { instanceId } = useParams();

    return (
        <div className="py-8">
            <EvaluationForm instanceId={instanceId} />
        </div>
    );
};

export default EvaluationFormView;
