import { LockOutlined, LogoutOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, message, Modal, Space, Typography } from 'antd';
import { AxiosError } from 'axios';
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import { useAuthStore } from '../store/authStore';

const { Title, Text } = Typography;

interface ErrorResponse {
  error: string;
  message: string;
}

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { handleLogout } = useAuth();
  const [isChangePasswordModalVisible, setIsChangePasswordModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleChangePassword = async (values: { currentPassword: string; newPassword: string }) => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      await apiService.changePassword(values.currentPassword, values.newPassword);
      message.success('Пароль успешно изменен');
      setIsChangePasswordModalVisible(false);
      handleLogout();
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage = axiosError.response?.data?.message || 'Ошибка при изменении пароля';
      setErrorMessage(errorMessage);
      message.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setIsChangePasswordModalVisible(false);
    setErrorMessage('');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
              Личный кабинет
            </Title>
            <Text type="secondary">Добро пожаловать!</Text>
          </div>

          <div style={{ textAlign: 'center' }}>
            <Text strong style={{ fontSize: '16px' }}>
              Email: {user?.email}
            </Text>
          </div>

          <Space direction="vertical" style={{ width: '100%' }}>
            <Button
              type="primary"
              icon={<LockOutlined />}
              onClick={() => setIsChangePasswordModalVisible(true)}
              style={{ width: '100%' }}
            >
              Изменить пароль
            </Button>

            <Button
              danger
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              style={{ width: '100%' }}
            >
              Выйти
            </Button>
          </Space>
        </Space>
      </Card>

      <Modal
        title="Изменить пароль"
        open={isChangePasswordModalVisible}
        onCancel={handleModalClose}
        footer={null}
      >
        <Form layout="vertical" onFinish={handleChangePassword}>
          {errorMessage && (
            <Form.Item>
              <div
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#fff2f0',
                  border: '1px solid #ffccc7',
                  borderRadius: '6px',
                  color: '#ff4d4f',
                  fontSize: '14px',
                }}
              >
                {errorMessage}
              </div>
            </Form.Item>
          )}

          <Form.Item
            label="Текущий пароль"
            name="currentPassword"
            rules={[
              { required: true, message: 'Введите текущий пароль' },
              { min: 6, message: 'Пароль должен содержать минимум 6 символов' },
            ]}
          >
            <Input.Password placeholder="Введите текущий пароль" />
          </Form.Item>

          <Form.Item
            label="Новый пароль"
            name="newPassword"
            rules={[
              { required: true, message: 'Введите новый пароль' },
              { min: 6, message: 'Пароль должен содержать минимум 6 символов' },
            ]}
          >
            <Input.Password placeholder="Введите новый пароль" />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={handleModalClose}>Отмена</Button>
              <Button type="primary" htmlType="submit" loading={isLoading}>
                Изменить пароль
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
