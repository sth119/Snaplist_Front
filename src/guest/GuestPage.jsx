import { useFile } from '../common/Context';

const GuestPage = () => {
  const { files } = useFile();

  return (
    <div className="file-grid">
      {files.length === 0 ? (
        <p style={{textAlign: 'center', color: '#999', marginTop: '50px'}}>
          아직 링크가 없어요.<br/>좌측 + 생성 버튼을 눌러 추가해보세요!
        </p>
      ) : (
        files.map(file => (
          <div key={file.id} className="file-item">
            <div className="icon">Link</div>
            <p>{file.title}</p>
            <small style={{wordBreak: 'break-all'}}>{file.url}</small>
          </div>
        ))
      )}
    </div>
  );
};

export default GuestPage;